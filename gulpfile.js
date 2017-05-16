const gulp = require('gulp');

// Create an electron-connect server to enable reloading
const electron = require('electron-connect').server.create();

gulp.task('start', () => {
    electron.start("./app");
    gulp.watch(['./app/main-process/**/*.js'], electron.restart);
    gulp.watch(['./app/bundle/**/*.js'], electron.reload);
    //watch html
    gulp.watch(['./app/index.html'], electron.reload);
});