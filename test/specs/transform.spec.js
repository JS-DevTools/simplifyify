"use strict";

const cli = require("../fixtures/cli");
const mocha = require("../fixtures/mocha");
const assert = require("../fixtures/assert");
const expect = require("chai").expect;

describe("browserify transforms", () => {
  beforeEach(function () {
    // Increase the test timeouts to allow sufficient time for Browserify transforms
    mocha.increaseTimeout(this.currentTest, 15000);
  });

  it("should use the browserify.transform field in package.json", (done) => {
    cli.run("es6/src/**/*.js --bundle --minify --debug --coverage --outfile es6/dist/", (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.contain("es6/src/index.js --> es6/dist/index.js");
      expect(stdout).to.contain("es6/src/index.js --> es6/dist/index.js.map");
      expect(stdout).to.contain("es6/src/index.js --> es6/dist/index.min.js");
      expect(stdout).to.contain("es6/src/index.js --> es6/dist/index.min.js.map");
      expect(stdout).to.contain("es6/src/index.js --> es6/dist/index.coverage.js");
      expect(stdout).to.contain("es6/src/hello-world.js --> es6/dist/hello-world.js");
      expect(stdout).to.contain("es6/src/hello-world.js --> es6/dist/hello-world.js.map");
      expect(stdout).to.contain("es6/src/hello-world.js --> es6/dist/hello-world.min.js");
      expect(stdout).to.contain("es6/src/hello-world.js --> es6/dist/hello-world.min.js.map");
      expect(stdout).to.contain("es6/src/hello-world.js --> es6/dist/hello-world.coverage.js");
      expect(stdout).to.contain("es6/src/say/index.js --> es6/dist/say/index.js");
      expect(stdout).to.contain("es6/src/say/index.js --> es6/dist/say/index.js.map");
      expect(stdout).to.contain("es6/src/say/index.js --> es6/dist/say/index.min.js");
      expect(stdout).to.contain("es6/src/say/index.js --> es6/dist/say/index.min.js.map");
      expect(stdout).to.contain("es6/src/say/index.js --> es6/dist/say/index.coverage.js");

      assert.directoryContents("es6/dist", [
        "index.js",
        "index.js.map",
        "index.min.js",
        "index.min.js.map",
        "index.coverage.js",
        "hello-world.js",
        "hello-world.js.map",
        "hello-world.min.js",
        "hello-world.min.js.map",
        "hello-world.coverage.js",
        "say/index.js",
        "say/index.js.map",
        "say/index.min.js",
        "say/index.min.js.map",
        "say/index.coverage.js",
      ]);

      assert.fileContents("es6/dist", ["index.js", "hello-world.js", "say/index.js"], (contents) => {
        assert.noBanner(contents);
        assert.notMinified(contents);
        assert.hasPreamble(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("es6/dist", ["index.min.js", "hello-world.min.js", "say/index.min.js"], (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("es6/dist", ["index.coverage.js", "hello-world.coverage.js", "say/index.coverage.js"], (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents, true);
        assert.noSourceMap(contents);
        assert.hasCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("es6/dist", ["index.js.map", "index.min.js.map"], (contents) => {
        expect(contents.sources).to.contain.members([
          "../src/hello-world.js",
          "../src/index.js",
          "../src/say/index.js"
        ]);
      });

      assert.fileContents("es6/dist", ["hello-world.js.map", "hello-world.min.js.map"], (contents) => {
        expect(contents.sources).to.contain.members([
          "../src/hello-world.js",
          "../src/say/index.js"
        ]);
      });

      assert.fileContents("es6/dist/say", ["index.js.map", "index.min.js.map"], (contents) => {
        expect(contents.sources).to.contain.members([
          "../../src/say/index.js"
        ]);
      });

      done();
    });
  });

  it("should use the transform options in the browserify.transform field", (done) => {
    cli.run("es6-with-options/src/**/*.js --bundle --minify --debug --coverage --outfile es6-with-options/dist/", (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.contain("es6-with-options/src/index.js --> es6-with-options/dist/index.js");
      expect(stdout).to.contain("es6-with-options/src/index.js --> es6-with-options/dist/index.js.map");
      expect(stdout).to.contain("es6-with-options/src/index.js --> es6-with-options/dist/index.min.js");
      expect(stdout).to.contain("es6-with-options/src/index.js --> es6-with-options/dist/index.min.js.map");
      expect(stdout).to.contain("es6-with-options/src/index.js --> es6-with-options/dist/index.coverage.js");
      expect(stdout).to.contain("es6-with-options/src/hello-world.js --> es6-with-options/dist/hello-world.js");
      expect(stdout).to.contain("es6-with-options/src/hello-world.js --> es6-with-options/dist/hello-world.js.map");
      expect(stdout).to.contain("es6-with-options/src/hello-world.js --> es6-with-options/dist/hello-world.min.js");
      expect(stdout).to.contain("es6-with-options/src/hello-world.js --> es6-with-options/dist/hello-world.min.js.map");
      expect(stdout).to.contain("es6-with-options/src/hello-world.js --> es6-with-options/dist/hello-world.coverage.js");
      expect(stdout).to.contain("es6-with-options/src/say/index.js --> es6-with-options/dist/say/index.js");
      expect(stdout).to.contain("es6-with-options/src/say/index.js --> es6-with-options/dist/say/index.js.map");
      expect(stdout).to.contain("es6-with-options/src/say/index.js --> es6-with-options/dist/say/index.min.js");
      expect(stdout).to.contain("es6-with-options/src/say/index.js --> es6-with-options/dist/say/index.min.js.map");
      expect(stdout).to.contain("es6-with-options/src/say/index.js --> es6-with-options/dist/say/index.coverage.js");

      assert.directoryContents("es6-with-options/dist", [
        "index.js",
        "index.js.map",
        "index.min.js",
        "index.min.js.map",
        "index.coverage.js",
        "hello-world.js",
        "hello-world.js.map",
        "hello-world.min.js",
        "hello-world.min.js.map",
        "hello-world.coverage.js",
        "say/index.js",
        "say/index.js.map",
        "say/index.min.js",
        "say/index.min.js.map",
        "say/index.coverage.js",
      ]);

      assert.fileContents("es6-with-options/dist", ["index.js", "hello-world.js", "say/index.js"], (contents) => {
        assert.noBanner(contents);
        assert.hasPreamble(contents);
        assert.notMinified(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("es6-with-options/dist", ["index.min.js", "hello-world.min.js", "say/index.min.js"], (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("es6-with-options/dist", ["index.coverage.js", "hello-world.coverage.js", "say/index.coverage.js"], (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents, true);
        assert.noSourceMap(contents);
        assert.hasCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("es6-with-options/dist", ["index.js.map", "index.min.js.map"], (contents) => {
        expect(contents.sources).to.contain.members([
          "../src/hello-world.js",
          "../src/index.js",
          "../src/say/index.js"
        ]);
      });

      assert.fileContents("es6-with-options/dist", ["hello-world.js.map", "hello-world.min.js.map"], (contents) => {
        expect(contents.sources).to.contain.members([
          "../src/hello-world.js",
          "../src/say/index.js"
        ]);
      });

      assert.fileContents("es6-with-options/dist/say", ["index.js.map", "index.min.js.map"], (contents) => {
        expect(contents.sources).to.contain.members([
          "../../src/say/index.js"
        ]);
      });

      done();
    });
  });

  it("should use the browserify.transform field for built-in transforms", (done) => {
    cli.run("transform-options/src/**/*.js --bundle --minify --debug --coverage --outfile transform-options/dist/", (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.contain("transform-options/src/index.js --> transform-options/dist/index.js");
      expect(stdout).to.contain("transform-options/src/index.js --> transform-options/dist/index.js.map");
      expect(stdout).to.contain("transform-options/src/index.js --> transform-options/dist/index.min.js");
      expect(stdout).to.contain("transform-options/src/index.js --> transform-options/dist/index.min.js.map");
      expect(stdout).to.contain("transform-options/src/index.js --> transform-options/dist/index.coverage.js");
      expect(stdout).to.contain("transform-options/src/hello-world.js --> transform-options/dist/hello-world.js");
      expect(stdout).to.contain("transform-options/src/hello-world.js --> transform-options/dist/hello-world.js.map");
      expect(stdout).to.contain("transform-options/src/hello-world.js --> transform-options/dist/hello-world.min.js");
      expect(stdout).to.contain("transform-options/src/hello-world.js --> transform-options/dist/hello-world.min.js.map");
      expect(stdout).to.contain("transform-options/src/hello-world.js --> transform-options/dist/hello-world.coverage.js");
      expect(stdout).to.contain("transform-options/src/say/index.js --> transform-options/dist/say/index.js");
      expect(stdout).to.contain("transform-options/src/say/index.js --> transform-options/dist/say/index.js.map");
      expect(stdout).to.contain("transform-options/src/say/index.js --> transform-options/dist/say/index.min.js");
      expect(stdout).to.contain("transform-options/src/say/index.js --> transform-options/dist/say/index.min.js.map");
      expect(stdout).to.contain("transform-options/src/say/index.js --> transform-options/dist/say/index.coverage.js");

      assert.directoryContents("transform-options/dist", [
        "index.js",
        "index.js.map",
        "index.min.js",
        "index.min.js.map",
        "index.coverage.js",
        "hello-world.js",
        "hello-world.js.map",
        "hello-world.min.js",
        "hello-world.min.js.map",
        "hello-world.coverage.js",
        "say/index.js",
        "say/index.js.map",
        "say/index.min.js",
        "say/index.min.js.map",
        "say/index.coverage.js",
      ]);

      assert.fileContents("transform-options/dist", ["index.js", "hello-world.js", "say/index.js"], (contents) => {
        assert.hasBanner(contents);
        assert.hasPreamble(contents);
        assert.notMinified(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("transform-options/dist", ["index.min.js", "hello-world.min.js", "say/index.min.js"], (contents) => {
        assert.hasBanner(contents);
        assert.hasPreamble(contents);
        assert.notMinified(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("transform-options/dist", ["index.coverage.js", "hello-world.coverage.js", "say/index.coverage.js"], (contents) => {
        assert.hasBanner(contents);
        assert.hasPreamble(contents);
        assert.notMinified(contents);
        assert.noSourceMap(contents);
        assert.hasCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("transform-options/dist", ["index.js.map", "index.min.js.map"], (contents) => {
        expect(contents.sources).to.contain.members([
          "../src/hello-world.js",
          "../src/index.js",
          "../src/say/index.js"
        ]);
      });

      assert.fileContents("transform-options/dist", ["hello-world.js.map", "hello-world.min.js.map"], (contents) => {
        expect(contents.sources).to.contain.members([
          "../src/hello-world.js",
          "../src/say/index.js"
        ]);
      });

      assert.fileContents("transform-options/dist/say", ["index.js.map", "index.min.js.map"], (contents) => {
        expect(contents.sources).to.contain.members([
          "../../src/say/index.js"
        ]);
      });

      done();
    });
  });
});
