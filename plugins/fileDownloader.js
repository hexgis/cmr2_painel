import FileDownloader from '~/utils/fileDownloader'

export default (context, inject) => {
  const fileDownloader = new FileDownloader(context.$api, context.$toast)
  inject('fileDownloader', fileDownloader)
}
