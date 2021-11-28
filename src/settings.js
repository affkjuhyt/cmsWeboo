module.exports = {
  title: process.env.VUE_APP_TITLE || "WebooAdmin",

  sideTheme: "theme-dark",

  showSettings: false,

  tagsView: true,

  fixedHeader: false,

  sidebarLogo: true,

  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: "production"
};
