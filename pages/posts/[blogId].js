import React from 'react'
import { fetchBlogPost, fetchBlogPostsIDs } from '../../graphql/queries'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

import { parseImageMarkdown } from '../../utils'

const OptimizedImage = (node) => {
  return node.children[0].tagName === 'img' ? (
    <Image src={node.children[0].props.src} layout="fill" objectFit="contain" />
  ) : (
    <p>{node.children[0]}</p>
  )
}

const FormattedCode = ({ className, children }) => {
  // Removing "language-" because React-Markdown already added "language-"
  const language = className.replace('language-', '')
  return (
    <SyntaxHighlighter
      style={materialDark}
      language={language}
      children={children[0]}
    />
  )
}
function Post({ blogData }) {
  console.log(blogData)
  return (
    <div>
      {blogData.headerImage.src && (
        <div>
          <Image
            src={blogData.headerImage.src}
            blurDataURL={blogData.headerImage.base64}
            placeholder="blur"
            width={blogData.headerImage.img.width}
            height={blogData.headerImage.img.height}
          />
        </div>
      )}
      <div>
        <ReactMarkdown
          components={{
            p: OptimizedImage,
            code: FormattedCode,
          }}
        >
          {blogData.body}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default Post

export async function getStaticPaths() {
  const blogPosts = await fetchBlogPostsIDs(
    'mtliendo',
    'sample-ssr',
    process.env.GITHUB_TOKEN
  )
  const paths = blogPosts.map((blogPost) => ({
    params: { blogId: blogPost.number.toString() },
  }))

  return {
    paths,
    fallback: true,
  }
}

export async function getStaticProps({ params }) {
  const blogPost = await fetchBlogPost(
    'mtliendo',
    'sample-ssr',
    process.env.GITHUB_TOKEN,
    params.blogId
  )
  const id = blogPost.number
  const author = blogPost.author.login
  const title = blogPost.title
  const body = blogPost.body
  const tags = blogPost.labels.nodes.map((label) => ({
    tag: label.name,
    color: label.color,
  }))
  console.log(blogPost)
  const headerImageString = blogPost.comments.nodes[0]?.body || null
  return {
    props: {
      blogData: {
        id,
        author,
        title,
        body,
        tags,
        headerImage: await parseImageMarkdown(headerImageString),
      },
    },
    revalidate: 10,
  }
}
