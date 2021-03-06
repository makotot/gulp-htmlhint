/*global describe, it*/
"use strict";

var fs = require("fs"),
	es = require("event-stream"),
	should = require("should"),
    gutil = require("gulp-util"),
    path = require('path'),
    File = gutil.File,
	htmlhint = require("../");

require("mocha");

var getFile = function(filePath) {
    filePath = 'test/'+filePath;
    return new File({
        path: filePath,
        cwd: 'test/',
        base: path.dirname(filePath),
        contents: fs.readFileSync(filePath)
    });
};

describe("gulp-htmlhint", function () {

	it("should pass valid file", function (done) {
        var valid = 0;

        var fakeFile = getFile("fixtures/valid.html");

		var stream = htmlhint();

		stream.on("error", function(err) {
			should.not.exist(err);
		});

		stream.on("data", function (file) {
            should.exist(file);
            file.htmlhint.success.should.equal(true);
            should.exist(file.path);
            should.exist(file.relative);
            should.exist(file.contents);
            ++valid;
		});

        stream.once('end', function () {
            valid.should.equal(1);
            done();
        });

        stream.write(fakeFile);
		stream.end();
	});


    it("should fail invalid file", function (done) {
        var invalid = 0;

        var fakeFile = getFile("fixtures/invalid.html");

        var stream = htmlhint();

        stream.on("error", function(err) {
            should.not.exist(err);
        });

        stream.on("data", function (file) {
            should.exist(file);
            file.htmlhint.success.should.equal(false);
            file.htmlhint.errorCount.should.equal(1);
            file.htmlhint.messages.length.should.equal(1);
            should.exist(file.path);
            should.exist(file.relative);
            should.exist(file.contents);
            ++invalid;
        });

        stream.once('end', function () {
            invalid.should.equal(1);
            done();
        });

        stream.write(fakeFile);
        stream.end();
    });

    it('should lint two files', function(done) {
        var a = 0;

        var file1 = getFile("fixtures/valid.html");
        var file2 = getFile("fixtures/invalid.html");

        var stream = htmlhint();
        stream.on('data', function(newFile) {
            ++a;
        });

        stream.once('end', function() {
            a.should.equal(2);
            done();
        });

        stream.write(file1);
        stream.write(file2);
        stream.end();
    });

    it('should support options', function(done) {
        var a = 0;

        var file = getFile('fixtures/invalid.html');

        var stream = htmlhint({
            'tag-pair': false
        });
        stream.on('data', function(newFile) {
            ++a;
            should.exist(newFile.htmlhint.success);
            newFile.htmlhint.success.should.equal(true);
            should.not.exist(newFile.htmlhint.results);
            should.not.exist(newFile.htmlhint.options);
        });
        stream.once('end', function() {
            a.should.equal(1);
            done();
        });

        stream.write(file);
        stream.end();
    });

    it('should support htmlhintrc', function(done) {
        var a = 0;

        var file = getFile('fixtures/invalid.html');

        var stream = htmlhint('test/htmlhintrc.json');
        stream.on('data', function(newFile) {
            ++a;
            should.exist(newFile.htmlhint.success);
            newFile.htmlhint.success.should.equal(true);
            should.not.exist(newFile.htmlhint.results);
            should.not.exist(newFile.htmlhint.options);
        });
        stream.once('end', function() {
            a.should.equal(1);
            done();
        });

        stream.write(file);
        stream.end();
    });

});
