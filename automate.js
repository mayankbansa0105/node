console.log('Automation is being started...');
const fs = require('fs')
const path = require('path')

const folderPath = 'build/static/media/';

const files = fs.readdirSync(folderPath);

const masterDataSourceFolder = '../Master Data/'

files.map((currElement, index) => {
    fs.copyFile(`${masterDataSourceFolder}${currElement.substr(0 ,currElement.indexOf('.'))}.csv`, `build/static/media/${currElement}`, (err) => {
        if (err) throw err;
        console.log('File has been copied');
    });
});
