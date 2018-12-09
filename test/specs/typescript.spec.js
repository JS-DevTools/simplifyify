"use strict";

const cli = require("../fixtures/cli");
const mocha = require("../fixtures/mocha");
const assert = require("../fixtures/assert");
const expect = require("chai").expect;

describe("TypeScript support", () => {
  beforeEach(function () {
    // Increase the test timeouts to allow sufficient time for Browserify transforms
    mocha.increaseTimeout(this.currentTest, 45000);
  });

  it("should automatically enable TypeScript if the entry file has a .ts extenstion", (done) => {
    cli.run("typescript/src/index.ts --bundle --minify --debug --coverage --outfile typescript/dist/", (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.contain("typescript/src/index.ts --> typescript/dist/index.js");
      expect(stdout).to.contain("typescript/src/index.ts --> typescript/dist/index.js.map");
      expect(stdout).to.contain("typescript/src/index.ts --> typescript/dist/index.min.js");
      expect(stdout).to.contain("typescript/src/index.ts --> typescript/dist/index.min.js.map");
      expect(stdout).to.contain("typescript/src/index.ts --> typescript/dist/index.coverage.js");

      assert.directoryContents("typescript/dist", [
        "index.js",
        "index.js.map",
        "index.min.js",
        "index.min.js.map",
        "index.coverage.js",
      ]);

      assert.fileContents("typescript/dist", "index.js", (contents) => {
        assert.noBanner(contents);
        assert.notMinified(contents);
        assert.hasPreamble(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("typescript/dist", "index.min.js", (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("typescript/dist", "index.coverage.js", (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents, true);
        assert.noSourceMap(contents);
        assert.hasCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("typescript/dist", ["index.js.map", "index.min.js.map"], (contents) => {
        expect(contents.sources).to.contain.members([
          "../src/hello-world.tsx",
          "../src/index.ts",
          "../src/say/index.ts"
        ]);
      });

      done();
    });
  });

  it("should automatically enable TypeScript if the entry files has a .tsx extenstion", (done) => {
    cli.run("typescript/src/hello-world.tsx --bundle --minify --debug --coverage --outfile typescript/dist/", (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.contain("typescript/src/hello-world.tsx --> typescript/dist/hello-world.js");
      expect(stdout).to.contain("typescript/src/hello-world.tsx --> typescript/dist/hello-world.js.map");
      expect(stdout).to.contain("typescript/src/hello-world.tsx --> typescript/dist/hello-world.min.js");
      expect(stdout).to.contain("typescript/src/hello-world.tsx --> typescript/dist/hello-world.min.js.map");
      expect(stdout).to.contain("typescript/src/hello-world.tsx --> typescript/dist/hello-world.coverage.js");

      assert.directoryContents("typescript/dist", [
        "hello-world.js",
        "hello-world.js.map",
        "hello-world.min.js",
        "hello-world.min.js.map",
        "hello-world.coverage.js",
      ]);

      assert.fileContents("typescript/dist", "hello-world.js", (contents) => {
        assert.noBanner(contents);
        assert.notMinified(contents);
        assert.hasPreamble(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("typescript/dist", "hello-world.min.js", (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("typescript/dist", "hello-world.coverage.js", (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents, true);
        assert.noSourceMap(contents);
        assert.hasCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("typescript/dist", ["hello-world.js.map", "hello-world.min.js.map"], (contents) => {
        expect(contents.sources).to.contain.members([
          "../src/hello-world.tsx",
          "../src/say/index.ts",
        ]);
      });

      done();
    });
  });

  it("should automatically enable TypeScript for all entry files that have a .ts or .tsx extenstion", (done) => {
    cli.run("typescript/src/**/*.ts* --bundle --minify --debug --coverage --outfile typescript/dist/", (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.contain("typescript/src/index.ts --> typescript/dist/index.js");
      expect(stdout).to.contain("typescript/src/index.ts --> typescript/dist/index.js.map");
      expect(stdout).to.contain("typescript/src/index.ts --> typescript/dist/index.min.js");
      expect(stdout).to.contain("typescript/src/index.ts --> typescript/dist/index.min.js.map");
      expect(stdout).to.contain("typescript/src/index.ts --> typescript/dist/index.coverage.js");
      expect(stdout).to.contain("typescript/src/hello-world.tsx --> typescript/dist/hello-world.js");
      expect(stdout).to.contain("typescript/src/hello-world.tsx --> typescript/dist/hello-world.js.map");
      expect(stdout).to.contain("typescript/src/hello-world.tsx --> typescript/dist/hello-world.min.js");
      expect(stdout).to.contain("typescript/src/hello-world.tsx --> typescript/dist/hello-world.min.js.map");
      expect(stdout).to.contain("typescript/src/hello-world.tsx --> typescript/dist/hello-world.coverage.js");
      expect(stdout).to.contain("typescript/src/say/index.ts --> typescript/dist/say/index.js");
      expect(stdout).to.contain("typescript/src/say/index.ts --> typescript/dist/say/index.js.map");
      expect(stdout).to.contain("typescript/src/say/index.ts --> typescript/dist/say/index.min.js");
      expect(stdout).to.contain("typescript/src/say/index.ts --> typescript/dist/say/index.min.js.map");
      expect(stdout).to.contain("typescript/src/say/index.ts --> typescript/dist/say/index.coverage.js");

      assert.directoryContents("typescript/dist", [
        "hello-world.coverage.js",
        "hello-world.js",
        "hello-world.js.map",
        "hello-world.min.js",
        "hello-world.min.js.map",
        "index.coverage.js",
        "index.js",
        "index.js.map",
        "index.min.js",
        "index.min.js.map",
        "say/index.coverage.js",
        "say/index.js",
        "say/index.js.map",
        "say/index.min.js",
        "say/index.min.js.map",
      ]);

      assert.fileContents("typescript/dist", ["index.js", "hello-world.js", "say/index.js"], (contents) => {
        assert.noBanner(contents);
        assert.notMinified(contents);
        assert.hasPreamble(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("typescript/dist", ["index.min.js", "hello-world.min.js", "say/index.min.js"], (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("typescript/dist", ["index.coverage.js", "hello-world.coverage.js", "say/index.coverage.js"], (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents, true);
        assert.noSourceMap(contents);
        assert.hasCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("typescript/dist", ["index.js.map", "index.min.js.map"], (contents) => {
        expect(contents.sources).to.contain.members([
          "../src/index.ts",
          "../src/hello-world.tsx",
          "../src/say/index.ts",
        ]);
      });

      assert.fileContents("typescript/dist", ["hello-world.js.map", "hello-world.min.js.map"], (contents) => {
        expect(contents.sources).to.contain.members([
          "../src/hello-world.tsx",
          "../src/say/index.ts",
        ]);
      });

      assert.fileContents("typescript/dist", ["say/index.js.map", "say/index.min.js.map"], (contents) => {
        expect(contents.sources).to.contain.members([
          "../../src/say/index.ts",
        ]);
      });

      done();
    });
  });

  it("should get TSify options from tsconfig.json", (done) => {
    cli.run("typescript-tsconfig/src/index.ts --bundle --minify --debug --coverage --outfile typescript-tsconfig/dist/", (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.contain("typescript-tsconfig/src/index.ts --> typescript-tsconfig/dist/index.js");
      expect(stdout).to.contain("typescript-tsconfig/src/index.ts --> typescript-tsconfig/dist/index.js.map");
      expect(stdout).to.contain("typescript-tsconfig/src/index.ts --> typescript-tsconfig/dist/index.min.js");
      expect(stdout).to.contain("typescript-tsconfig/src/index.ts --> typescript-tsconfig/dist/index.min.js.map");
      expect(stdout).to.contain("typescript-tsconfig/src/index.ts --> typescript-tsconfig/dist/index.coverage.js");

      assert.directoryContents("typescript-tsconfig/dist", [
        "index.js",
        "index.js.map",
        "index.min.js",
        "index.min.js.map",
        "index.coverage.js",
      ]);

      assert.fileContents("typescript-tsconfig/dist", "index.js", (contents) => {
        assert.noBanner(contents);
        assert.notMinified(contents);
        assert.hasPreamble(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("typescript-tsconfig/dist", "index.min.js", (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("typescript-tsconfig/dist", "index.coverage.js", (contents) => {
        assert.noBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents, true);
        assert.noSourceMap(contents);
        assert.hasCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("typescript-tsconfig/dist", ["index.js.map", "index.min.js.map"], (contents) => {
        expect(contents.sources).to.contain.members([
          "../src/hello-world.tsx",
          "../src/index.ts",
          "../src/say/index.ts"
        ]);
      });

      done();
    });
  });

  it("should get TSify options from package.json", (done) => {
    cli.run("typescript-options/src/index.ts --bundle --minify --debug --coverage --outfile typescript-options/dist/", (err, stdout) => {
      if (err) {
        return done(err);
      }

      expect(stdout).to.contain("typescript-options/src/index.ts --> typescript-options/dist/index.js");
      expect(stdout).to.contain("typescript-options/src/index.ts --> typescript-options/dist/index.js.map");
      expect(stdout).to.contain("typescript-options/src/index.ts --> typescript-options/dist/index.min.js");
      expect(stdout).to.contain("typescript-options/src/index.ts --> typescript-options/dist/index.min.js.map");
      expect(stdout).to.contain("typescript-options/src/index.ts --> typescript-options/dist/index.coverage.js");

      assert.directoryContents("typescript-options/dist", [
        "index.js",
        "index.js.map",
        "index.min.js",
        "index.min.js.map",
        "index.coverage.js",
      ]);

      assert.fileContents("typescript-options/dist", "index.js", (contents) => {
        assert.hasBanner(contents);
        assert.notMinified(contents);
        assert.hasPreamble(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("typescript-options/dist", "index.min.js", (contents) => {
        assert.hasBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents);
        assert.hasSourceMap(contents);
        assert.noCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("typescript-options/dist", "index.coverage.js", (contents) => {
        assert.hasBanner(contents);
        assert.hasMinifiedPreamble(contents);
        assert.isMinified(contents, true);
        assert.noSourceMap(contents);
        assert.hasCoverage(contents);
        assert.isBabelified(contents);
      });

      assert.fileContents("typescript-options/dist", ["index.js.map", "index.min.js.map"], (contents) => {
        expect(contents.sources).to.contain.members([
          "../src/hello-world.tsx",
          "../src/index.ts",
          "../src/say/index.ts"
        ]);
      });

      done();
    });
  });

});
