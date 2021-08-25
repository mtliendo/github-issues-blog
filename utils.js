import { getPlaiceholder } from 'plaiceholder'
export const parseImageMarkdown = async (imageMarkdown) => {
  const regExpForMarkdownImageLink = /\(([^)]+)\)/
  const regExpForMarkdownImageAltText = /\[([^)]+)\]/
  let imageDetails = {}

  if (imageMarkdown) {
    imageDetails.src =
      imageMarkdown && imageMarkdown.match(regExpForMarkdownImageLink)[1]
    imageDetails.alt = imageMarkdown.match(regExpForMarkdownImageAltText)[1]

    const { base64, img } = await getPlaiceholder(`${imageDetails.src}`)
    imageDetails.base64 = base64
    imageDetails.img = img
  }

  return imageDetails
}
