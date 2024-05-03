const i18n = require('i18n');
const path = require('path');

i18n.configure({
  locales: ['en',  'fr','ar'  ],
  defaultLocale: 'fr',
  directory: path.join(__dirname, '..', 'locales'),
  objectNotation: true
});



module.exports = (req, res, next) => {
  i18n.init(req, res);
  const currentLocale = i18n.getLocale();
  req.locale = currentLocale;
  res.setLocale(currentLocale);
  next();
};
