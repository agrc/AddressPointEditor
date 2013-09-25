Broadband Editing Website
===================================

A collaborative tool for allowing counties to edit data to allow for the most up to date information.


## Intern Testing

```
grunt
```
- Lints `GruntFile.js`, `tests/intern.js`, `package.json`, and all files in `src/app`. And re-lints any time these files change.
- Starts a web server on port 8000 that's pointed at the root of the project.
- Open's the intern test runner in your default browser.
- Starts a live reload server that watches all files in `src/app`. This way you can enable it in your browser on the tab that has the intern test runner open so that your tests will run on save.

```
grunt phantomtest
```
- Starts phantom server.
- Run's intern tests via the runner.