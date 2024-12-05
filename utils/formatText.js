export function convertTextToHtml(text) {
    let formattedText = text.item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    formattedText = formattedText.replace(/\n/g, '<br>')

    return formattedText
}

export function convertHtmlToText(html) {
    let formattedText = html.item.replace(/\*\*.*?\*\*/g, '')
    formattedText = formattedText.replace(/\n/g, ' ')
    formattedText = formattedText.replace(/\s+/g, ' ').trim()

    return formattedText
}
