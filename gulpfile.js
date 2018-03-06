var gulp = require('gulp');
var eslint = require('gulp-eslint');
var gulpIf = require('gulp-if');

gulp.task('eslint', () => {
  return gulp.src('./src/js/*.js')
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
});

// Check if ESLint has run the fix
function isFixed(file) {
  return file.eslint !== null && file.eslint.fixed;
}

// New lint and fix task
gulp.task('eslint-fix', () => {
  return gulp.src('./src/js/*.js')
  .pipe(eslint({
    fix: true,
  }))
  .pipe(eslint.format())
  // Replace existing file with fixed one
  .pipe(gulpIf(isFixed, gulp.dest('./src/js')))
  .pipe(eslint.failAfterError())
});
