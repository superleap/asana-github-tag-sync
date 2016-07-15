import Promise from 'bluebird';
import childProcess from 'child_process';
import fs from 'fs';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import path from 'path';
import readPackage from 'read-package-json';
import conventionalChangelog from 'conventional-changelog';

let exec = childProcess.exec;
let pkg = Promise.promisify(readPackage);
let readFile = Promise.promisify(fs.readFile);
let writeFile = Promise.promisify(fs.writeFile);

const gp = gulpLoadPlugins();
const paths = {
    "pkg": "./package.json",
    "docs": "./build/docs",
    "manual": "./build/manual",
    "src": "./src",
    "compile": "./lib"
};

/**
 * Promisified child_process.exec
 * @param cmd
 * @param {Object} [opts={}] See child_process.exec node docs
 * @property {stream.Writable} [opts.stdout=process.stdout] - If defined, child process stdout will be piped to it.
 * @property {stream.Writable} [opts.stderr=process.stderr] - If defined, child process stderr will be piped to it.
 * @returns {Promise<{ stdout: string, stderr: stderr }>}
 */
function execp(cmd, opts = {}) {
    return new Promise((resolve, reject) => {
        const child = exec(cmd, opts,
            (err, stdout, stderr) => {
                return err ? reject(err) : resolve({
                    "stdout": stdout,
                    "stderr": stderr
                });
            });

        if (opts.stdout) {
            child.stdout.pipe(opts.stdout);
        }
        if (opts.stderr) {
            child.stderr.pipe(opts.stderr);
        }
    });
}

gulp.task(`changelog`, () => {
    return conventionalChangelog({
        preset: 'angular',
        releaseCount: 0,
        // debug: console.log
    })
        .pipe(fs.createWriteStream(`${paths.manual}/changelog.md`));
});

gulp.task(`manual`, [`changelog`], () => {
    // parse github readme for available sections
    return readFile(`./README.md`, `utf8`).then((response) => {
        // split file based on headers (##) and generate mapping
        let blocks = response.split(/\n##\s[^\n]+\n\n/i).map((element) => {
            return element;
        });

        return readFile(`${paths.manual}/changelog.md`, `utf8`).then((response) => {
            let versions = response.split(/<a name=`(?:(?:0|[1-9]\d*)\.){2}(?:0|[1-9]\d*)`><\/a>/i);
            versions.splice(0, 1);

            return versions.join(``);
        }).then((response) => {
            let bindings = {
                "index": `${blocks[0]}\n\n${blocks[1]}\n\n## LICENSE\n${blocks[6]}`,
                "installation": blocks[2],
                "usage": blocks[3],
                "configuration": blocks[4],
                "examples": blocks[5],
                "changelog": response
            };

            let log = [];

            // create async file write array
            for (let key in bindings) {
                if (Reflect.getOwnPropertyDescriptor(bindings, key)) {
                    let path = `${paths.manual}/${key}.md`;
                    let data = bindings[key];
                    log.push(fs.writeFileSync(path, data));
                }
            }

            return Promise.all(log).then((response) => {
                return response;
            });
        });
    });
});

gulp.task(`doc`, [`manual`], () => {
    let config = {
        "destination": paths.docs,
        "title": `GitHub Issues Label Sync Module`,
        "index": `${paths.manual}/index.md`,
        "manual": {
            "installation": [`${paths.manual}/installation.md`],
            "configuration": [`${paths.manual}/configuration.md`],
            "usage": [`${paths.manual}/usage.md`],
            "example": [`${paths.manual}/examples.md`],
            "changelog": [`${paths.manual}/changelog.md`]
        }
    };

    return gulp.src(paths.lib)
        .pipe(gp.esdoc(config));
});

gulp.task(`predeploy`, [`doc`], () => {
    return pkg(paths.pkg, console.log, true).then((data) => {
        let pkgName = data.name;
        let pkgUser = data.repository.url.match(/github\.com\/([^\/]+)\//i)[1];

        return writeFile(`${paths.docs}/CNAME`, `${pkgName}-package.${pkgUser}.xyz`);
    });
});

gulp.task(`deploy`, [`predeploy`], () => {
    if (`true` !== process.env.CI_RELEASE) {
        return false;
    }

    return gulp.src(`${paths.docs}/**/*`)
        .pipe(gp.ghPages());
});

gulp.task(`lint`, () => {
    return gulp.src([`**/*.js`, `!node_modules/**`])
        .pipe(gp.excludeGitignore())
        .pipe(gp.eslint())
        .pipe(gp.eslint.format())
        .pipe(gp.eslint.failAfterError());
});

gulp.task(`nsp`, (cb) => {
    return gp.nsp({"package": path.resolve(`package.json`)}, cb);
});

gulp.task(`bithound`, () => {
    if (`true` !== process.env.CI_RELEASE) {
        return false;
    }

    return pkg(paths.pkg, console.log, true).then((data) => {
        let pkgName = data.name;
        let pkgUser = data.repository.url.match(/github\.com\/([^\/]+)\//i)[1];

        return execp(`node_modules/.bin/bithound check git@github.com:${pkgUser}/${pkgName}.git`);
    });
});

gulp.task(`package`, () => {
    return execp(`node_modules/.bin/babel ${paths.src} --out-dir ${paths.compile}`);
});

gulp.task(`prepublish`, [`nsp`, `bithound`, `package`]);
gulp.task(`default`, [`prepublish`, `lint`]);
