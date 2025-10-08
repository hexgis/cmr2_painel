import fileUtils from '~/utils/fileUtils';

export default (context, inject) => {
  inject('fileUtils', fileUtils);
};
