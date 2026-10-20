const path=require('path');
const i18n=require('i18n');

i18n.configure({
    locales:['es', 'en'],
    defaultLocale:'en',
    directory: path.join(__dirname, '..', 'locales'),
    queryParameter: 'lang',
    header: 'accept-language',
    objectNotation: 'true',//permite usar objeto.valor
    cookie: 'lang'
});

module.exports=i18n;