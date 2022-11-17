

// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module != 'undefined' ? Module : {};

// See https://caniuse.com/mdn-javascript_builtins_object_assign

// See https://caniuse.com/mdn-javascript_builtins_bigint64array

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)


// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = typeof window == 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = typeof process == 'object' && typeof process.versions == 'object' && typeof process.versions.node == 'string';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (Module['ENVIRONMENT']) {
  throw new Error('Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)');
}

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary,
    setWindowTitle;

// Normally we don't log exceptions but instead let them bubble out the top
// level where the embedding environment (e.g. the browser) can handle
// them.
// However under v8 and node we sometimes exit the process direcly in which case
// its up to use us to log the exception before exiting.
// If we fix https://github.com/emscripten-core/emscripten/issues/15080
// this may no longer be needed under node.
function logExceptionOnExit(e) {
  if (e instanceof ExitStatus) return;
  let toLog = e;
  if (e && typeof e == 'object' && e.stack) {
    toLog = [e, e.stack];
  }
  err('exiting due to exception: ' + toLog);
}

if (ENVIRONMENT_IS_NODE) {
  if (typeof process == 'undefined' || !process.release || process.release.name !== 'node') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = require('path').dirname(scriptDirectory) + '/';
  } else {
    scriptDirectory = __dirname + '/';
  }

// include: node_shell_read.js


// These modules will usually be used on Node.js. Load them eagerly to avoid
// the complexity of lazy-loading. However, for now we must guard on require()
// actually existing: if the JS is put in a .mjs file (ES6 module) and run on
// node, then we'll detect node as the environment and get here, but require()
// does not exist (since ES6 modules should use |import|). If the code actually
// uses the node filesystem then it will crash, of course, but in the case of
// code that never uses it we don't want to crash here, so the guarding if lets
// such code work properly. See discussion in
// https://github.com/emscripten-core/emscripten/pull/17851
var fs, nodePath;
if (typeof require === 'function') {
  fs = require('fs');
  nodePath = require('path');
}

read_ = (filename, binary) => {
  filename = nodePath['normalize'](filename);
  return fs.readFileSync(filename, binary ? undefined : 'utf8');
};

readBinary = (filename) => {
  var ret = read_(filename, true);
  if (!ret.buffer) {
    ret = new Uint8Array(ret);
  }
  assert(ret.buffer);
  return ret;
};

readAsync = (filename, onload, onerror) => {
  filename = nodePath['normalize'](filename);
  fs.readFile(filename, function(err, data) {
    if (err) onerror(err);
    else onload(data.buffer);
  });
};

// end include: node_shell_read.js
  if (process['argv'].length > 1) {
    thisProgram = process['argv'][1].replace(/\\/g, '/');
  }

  arguments_ = process['argv'].slice(2);

  if (typeof module != 'undefined') {
    module['exports'] = Module;
  }

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });

  // Without this older versions of node (< v15) will log unhandled rejections
  // but return 0, which is not normally the desired behaviour.  This is
  // not be needed with node v15 and about because it is now the default
  // behaviour:
  // See https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode
  process['on']('unhandledRejection', function(reason) { throw reason; });

  quit_ = (status, toThrow) => {
    if (keepRuntimeAlive()) {
      process['exitCode'] = status;
      throw toThrow;
    }
    logExceptionOnExit(toThrow);
    process['exit'](status);
  };

  Module['inspect'] = function () { return '[Emscripten Module object]'; };

} else
if (ENVIRONMENT_IS_SHELL) {

  if ((typeof process == 'object' && typeof require === 'function') || typeof window == 'object' || typeof importScripts == 'function') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  if (typeof read != 'undefined') {
    read_ = function shell_read(f) {
      return read(f);
    };
  }

  readBinary = function readBinary(f) {
    let data;
    if (typeof readbuffer == 'function') {
      return new Uint8Array(readbuffer(f));
    }
    data = read(f, 'binary');
    assert(typeof data == 'object');
    return data;
  };

  readAsync = function readAsync(f, onload, onerror) {
    setTimeout(() => onload(readBinary(f)), 0);
  };

  if (typeof scriptArgs != 'undefined') {
    arguments_ = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    arguments_ = arguments;
  }

  if (typeof quit == 'function') {
    quit_ = (status, toThrow) => {
      logExceptionOnExit(toThrow);
      quit(status);
    };
  }

  if (typeof print != 'undefined') {
    // Prefer to use print/printErr where they exist, as they usually work better.
    if (typeof console == 'undefined') console = /** @type{!Console} */({});
    console.log = /** @type{!function(this:Console, ...*): undefined} */ (print);
    console.warn = console.error = /** @type{!function(this:Console, ...*): undefined} */ (typeof printErr != 'undefined' ? printErr : print);
  }

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document != 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
  // they are removed because they could contain a slash.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }

  if (!(typeof window == 'object' || typeof importScripts == 'function')) throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  {
// include: web_or_worker_shell_read.js


  read_ = (url) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
  }

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = (url) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
    };
  }

  readAsync = (url, onload, onerror) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  }

// end include: web_or_worker_shell_read.js
  }

  setWindowTitle = (title) => document.title = title;
} else
{
  throw new Error('environment detection error');
}

var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.warn.bind(console);

// Merge back in the overrides
Object.assign(Module, moduleOverrides);
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;
checkIncomingModuleAPI();

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];legacyModuleProp('arguments', 'arguments_');

if (Module['thisProgram']) thisProgram = Module['thisProgram'];legacyModuleProp('thisProgram', 'thisProgram');

if (Module['quit']) quit_ = Module['quit'];legacyModuleProp('quit', 'quit_');

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
// Assertions on removed incoming Module JS APIs.
assert(typeof Module['memoryInitializerPrefixURL'] == 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['pthreadMainPrefixURL'] == 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['cdInitializerPrefixURL'] == 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['filePackagePrefixURL'] == 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['read'] == 'undefined', 'Module.read option was removed (modify read_ in JS)');
assert(typeof Module['readAsync'] == 'undefined', 'Module.readAsync option was removed (modify readAsync in JS)');
assert(typeof Module['readBinary'] == 'undefined', 'Module.readBinary option was removed (modify readBinary in JS)');
assert(typeof Module['setWindowTitle'] == 'undefined', 'Module.setWindowTitle option was removed (modify setWindowTitle in JS)');
assert(typeof Module['TOTAL_MEMORY'] == 'undefined', 'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY');
legacyModuleProp('read', 'read_');
legacyModuleProp('readAsync', 'readAsync');
legacyModuleProp('readBinary', 'readBinary');
legacyModuleProp('setWindowTitle', 'setWindowTitle');
var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';
var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';
var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';
var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';

assert(!ENVIRONMENT_IS_SHELL, "shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable.");




var STACK_ALIGN = 16;
var POINTER_SIZE = 4;

function getNativeTypeSize(type) {
  switch (type) {
    case 'i1': case 'i8': case 'u8': return 1;
    case 'i16': case 'u16': return 2;
    case 'i32': case 'u32': return 4;
    case 'i64': case 'u64': return 8;
    case 'float': return 4;
    case 'double': return 8;
    default: {
      if (type[type.length - 1] === '*') {
        return POINTER_SIZE;
      }
      if (type[0] === 'i') {
        const bits = Number(type.substr(1));
        assert(bits % 8 === 0, 'getNativeTypeSize invalid bits ' + bits + ', type ' + type);
        return bits / 8;
      }
      return 0;
    }
  }
}

// include: runtime_debug.js


function legacyModuleProp(prop, newName) {
  if (!Object.getOwnPropertyDescriptor(Module, prop)) {
    Object.defineProperty(Module, prop, {
      configurable: true,
      get: function() {
        abort('Module.' + prop + ' has been replaced with plain ' + newName + ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)');
      }
    });
  }
}

function ignoredModuleProp(prop) {
  if (Object.getOwnPropertyDescriptor(Module, prop)) {
    abort('`Module.' + prop + '` was supplied but `' + prop + '` not included in INCOMING_MODULE_JS_API');
  }
}

// forcing the filesystem exports a few things by default
function isExportedByForceFilesystem(name) {
  return name === 'FS_createPath' ||
         name === 'FS_createDataFile' ||
         name === 'FS_createPreloadedFile' ||
         name === 'FS_unlink' ||
         name === 'addRunDependency' ||
         // The old FS has some functionality that WasmFS lacks.
         name === 'FS_createLazyFile' ||
         name === 'FS_createDevice' ||
         name === 'removeRunDependency';
}

function missingLibrarySymbol(sym) {
  if (typeof globalThis !== 'undefined' && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
    Object.defineProperty(globalThis, sym, {
      configurable: true,
      get: function() {
        // Can't `abort()` here because it would break code that does runtime
        // checks.  e.g. `if (typeof SDL === 'undefined')`.
        var msg = '`' + sym + '` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line';
        // DEFAULT_LIBRARY_FUNCS_TO_INCLUDE requires the name as it appears in
        // library.js, which means $name for a JS name with no prefix, or name
        // for a JS name like _name.
        var librarySymbol = sym;
        if (!librarySymbol.startsWith('_')) {
          librarySymbol = '$' + sym;
        }
        msg += " (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE=" + librarySymbol + ")";
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        warnOnce(msg);
        return undefined;
      }
    });
  }
}

function unexportedRuntimeSymbol(sym) {
  if (!Object.getOwnPropertyDescriptor(Module, sym)) {
    Object.defineProperty(Module, sym, {
      configurable: true,
      get: function() {
        var msg = "'" + sym + "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)";
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        abort(msg);
      }
    });
  }
}

// end include: runtime_debug.js


// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];legacyModuleProp('wasmBinary', 'wasmBinary');
var noExitRuntime = Module['noExitRuntime'] || true;legacyModuleProp('noExitRuntime', 'noExitRuntime');

if (typeof WebAssembly != 'object') {
  abort('no native wasm support detected');
}

// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed' + (text ? ': ' + text : ''));
  }
}

// We used to include malloc/free by default in the past. Show a helpful error in
// builds with assertions.
function _malloc() {
  abort("malloc() called but not included in the build - add '_malloc' to EXPORTED_FUNCTIONS");
}
function _free() {
  // Show a helpful error since we used to include free by default in the past.
  abort("free() called but not included in the build - add '_free' to EXPORTED_FUNCTIONS");
}

// include: runtime_strings.js


// runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.

var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.
/**
 * heapOrArray is either a regular array, or a JavaScript typed array view.
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
  while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
  }
  var str = '';
  // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
  while (idx < endPtr) {
    // For UTF8 byte structure, see:
    // http://en.wikipedia.org/wiki/UTF-8#Description
    // https://www.ietf.org/rfc/rfc2279.txt
    // https://tools.ietf.org/html/rfc3629
    var u0 = heapOrArray[idx++];
    if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
    var u1 = heapOrArray[idx++] & 63;
    if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
    var u2 = heapOrArray[idx++] & 63;
    if ((u0 & 0xF0) == 0xE0) {
      u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
    } else {
      if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte 0x' + u0.toString(16) + ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!');
      u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
    }

    if (u0 < 0x10000) {
      str += String.fromCharCode(u0);
    } else {
      var ch = u0 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    }
  }
  return str;
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
// copy of that string as a Javascript String object.
// maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
//                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
//                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
//                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
//                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
//                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
//                 throw JS JIT optimizations off, so it is worth to consider consistently using one
//                 style or the other.
/**
 * @param {number} ptr
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) {
      var u1 = str.charCodeAt(++i);
      u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 0xC0 | (u >> 6);
      heap[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 0xE0 | (u >> 12);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      if (u > 0x10FFFF) warnOnce('Invalid Unicode code point 0x' + u.toString(16) + ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).');
      heap[outIdx++] = 0xF0 | (u >> 18);
      heap[outIdx++] = 0x80 | ((u >> 12) & 63);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var c = str.charCodeAt(i); // possibly a lead surrogate
    if (c <= 0x7F) {
      len++;
    } else if (c <= 0x7FF) {
      len += 2;
    } else if (c >= 0xD800 && c <= 0xDFFF) {
      len += 4; ++i;
    } else {
      len += 3;
    }
  }
  return len;
}

// end include: runtime_strings.js
// Memory management

var HEAP,
/** @type {!ArrayBuffer} */
  buffer,
/** @type {!Int8Array} */
  HEAP8,
/** @type {!Uint8Array} */
  HEAPU8,
/** @type {!Int16Array} */
  HEAP16,
/** @type {!Uint16Array} */
  HEAPU16,
/** @type {!Int32Array} */
  HEAP32,
/** @type {!Uint32Array} */
  HEAPU32,
/** @type {!Float32Array} */
  HEAPF32,
/** @type {!Float64Array} */
  HEAPF64;

function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module['HEAP8'] = HEAP8 = new Int8Array(buf);
  Module['HEAP16'] = HEAP16 = new Int16Array(buf);
  Module['HEAP32'] = HEAP32 = new Int32Array(buf);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
}

var TOTAL_STACK = 5242880;
if (Module['TOTAL_STACK']) assert(TOTAL_STACK === Module['TOTAL_STACK'], 'the stack size can no longer be determined at runtime')

var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;legacyModuleProp('INITIAL_MEMORY', 'INITIAL_MEMORY');

assert(INITIAL_MEMORY >= TOTAL_STACK, 'INITIAL_MEMORY should be larger than TOTAL_STACK, was ' + INITIAL_MEMORY + '! (TOTAL_STACK=' + TOTAL_STACK + ')');

// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array != 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined,
       'JS engine does not provide full typed array support');

// If memory is defined in wasm, the user can't provide it.
assert(!Module['wasmMemory'], 'Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally');
assert(INITIAL_MEMORY == 16777216, 'Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically');

// include: runtime_init_table.js
// In regular non-RELOCATABLE mode the table is exported
// from the wasm module and this will be assigned once
// the exports are available.
var wasmTable;

// end include: runtime_init_table.js
// include: runtime_stack_check.js


// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  var max = _emscripten_stack_get_end();
  assert((max & 3) == 0);
  // The stack grow downwards towards _emscripten_stack_get_end.
  // We write cookies to the final two words in the stack and detect if they are
  // ever overwritten.
  HEAPU32[((max)>>2)] = 0x2135467;
  HEAPU32[(((max)+(4))>>2)] = 0x89BACDFE;
  // Also test the global address 0 for integrity.
  HEAPU32[0] = 0x63736d65; /* 'emsc' */
}

function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end();
  var cookie1 = HEAPU32[((max)>>2)];
  var cookie2 = HEAPU32[(((max)+(4))>>2)];
  if (cookie1 != 0x2135467 || cookie2 != 0x89BACDFE) {
    abort('Stack overflow! Stack cookie has been overwritten at 0x' + max.toString(16) + ', expected hex dwords 0x89BACDFE and 0x2135467, but received 0x' + cookie2.toString(16) + ' 0x' + cookie1.toString(16));
  }
  // Also test the global address 0 for integrity.
  if (HEAPU32[0] !== 0x63736d65 /* 'emsc' */) abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
}

// end include: runtime_stack_check.js
// include: runtime_assertions.js


// Endianness check
(function() {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 0x6373;
  if (h8[0] !== 0x73 || h8[1] !== 0x63) throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
})();

// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;

function keepRuntimeAlive() {
  return noExitRuntime;
}

function preRun() {

  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  assert(!runtimeInitialized);
  runtimeInitialized = true;

  checkStackCookie();

  
if (!Module["noFSInit"] && !FS.init.initialized)
  FS.init();
FS.ignorePermissions = false;

TTY.init();
  callRuntimeCallbacks(__ATINIT__);
}

function postRun() {
  checkStackCookie();

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

assert(Math.imul, 'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.fround, 'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.clz32, 'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.trunc, 'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
}

function addRunDependency(id) {
  runDependencies++;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval != 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err('still waiting on run dependencies:');
          }
          err('dependency: ' + dep);
        }
        if (shown) {
          err('(end of list)');
        }
      }, 10000);
    }
  } else {
    err('warning: run dependency added without ID');
  }
}

function removeRunDependency(id) {
  runDependencies--;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

/** @param {string|number=} what */
function abort(what) {
  {
    if (Module['onAbort']) {
      Module['onAbort'](what);
    }
  }

  what = 'Aborted(' + what + ')';
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // defintion for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// {{MEM_INITIALIZER}}

// include: memoryprofiler.js


// end include: memoryprofiler.js
// include: URIUtils.js


// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  // Prefix of data URIs emitted by SINGLE_FILE and related options.
  return filename.startsWith(dataURIPrefix);
}

// Indicates whether filename is delivered via file protocol (as opposed to http/https)
function isFileURI(filename) {
  return filename.startsWith('file://');
}

// end include: URIUtils.js
/** @param {boolean=} fixedasm */
function createExportWrapper(name, fixedasm) {
  return function() {
    var displayName = name;
    var asm = fixedasm;
    if (!fixedasm) {
      asm = Module['asm'];
    }
    assert(runtimeInitialized, 'native function `' + displayName + '` called before runtime initialization');
    if (!asm[name]) {
      assert(asm[name], 'exported native function `' + displayName + '` not found');
    }
    return asm[name].apply(null, arguments);
  };
}

var wasmBinaryFile;
  wasmBinaryFile = 'box2d.wasm';
  if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }

function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    if (readBinary) {
      return readBinary(file);
    }
    throw "both async and sync fetching of the wasm failed";
  }
  catch (err) {
    abort(err);
  }
}

function getBinaryPromise() {
  // If we don't have the binary yet, try to to load it asynchronously.
  // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
  // See https://github.com/github/fetch/pull/92#issuecomment-140665932
  // Cordova or Electron apps are typically loaded from a file:// url.
  // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch == 'function'
      && !isFileURI(wasmBinaryFile)
    ) {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
        if (!response['ok']) {
          throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        }
        return response['arrayBuffer']();
      }).catch(function () {
          return getBinary(wasmBinaryFile);
      });
    }
    else {
      if (readAsync) {
        // fetch is not available or url is file => try XHR (readAsync uses XHR internally)
        return new Promise(function(resolve, reject) {
          readAsync(wasmBinaryFile, function(response) { resolve(new Uint8Array(/** @type{!ArrayBuffer} */(response))) }, reject)
        });
      }
    }
  }

  // Otherwise, getBinary should be able to get it synchronously
  return Promise.resolve().then(function() { return getBinary(wasmBinaryFile); });
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': asmLibraryArg,
    'wasi_snapshot_preview1': asmLibraryArg,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    var exports = instance.exports;

    Module['asm'] = exports;

    wasmMemory = Module['asm']['memory'];
    assert(wasmMemory, "memory not found in wasm exports");
    // This assertion doesn't hold when emscripten is run in --post-link
    // mode.
    // TODO(sbc): Read INITIAL_MEMORY out of the wasm file in post-link mode.
    //assert(wasmMemory.buffer.byteLength === 16777216);
    updateGlobalBufferAndViews(wasmMemory.buffer);

    wasmTable = Module['asm']['__indirect_function_table'];
    assert(wasmTable, "table not found in wasm exports");

    addOnInit(Module['asm']['__wasm_call_ctors']);

    removeRunDependency('wasm-instantiate');

  }
  // we can't run yet (except in a pthread, where we have a custom sync instantiator)
  addRunDependency('wasm-instantiate');

  // Prefer streaming instantiation if available.
  // Async compilation can be confusing when an error on the page overwrites Module
  // (for example, if the order of elements is wrong, and the one defining Module is
  // later), so we save Module and check it later.
  var trueModule = Module;
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    assert(Module === trueModule, 'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?');
    trueModule = null;
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
    receiveInstance(result['instance']);
  }

  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise().then(function(binary) {
      return WebAssembly.instantiate(binary, info);
    }).then(function (instance) {
      return instance;
    }).then(receiver, function(reason) {
      err('failed to asynchronously prepare wasm: ' + reason);

      // Warn on some common problems.
      if (isFileURI(wasmBinaryFile)) {
        err('warning: Loading from a file URI (' + wasmBinaryFile + ') is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing');
      }
      abort(reason);
    });
  }

  function instantiateAsync() {
    if (!wasmBinary &&
        typeof WebAssembly.instantiateStreaming == 'function' &&
        !isDataURI(wasmBinaryFile) &&
        // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
        !isFileURI(wasmBinaryFile) &&
        // Avoid instantiateStreaming() on Node.js environment for now, as while
        // Node.js v18.1.0 implements it, it does not have a full fetch()
        // implementation yet.
        //
        // Reference:
        //   https://github.com/emscripten-core/emscripten/pull/16917
        !ENVIRONMENT_IS_NODE &&
        typeof fetch == 'function') {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
        // Suppress closure warning here since the upstream definition for
        // instantiateStreaming only allows Promise<Repsponse> rather than
        // an actual Response.
        // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure is fixed.
        /** @suppress {checkTypes} */
        var result = WebAssembly.instantiateStreaming(response, info);

        return result.then(
          receiveInstantiationResult,
          function(reason) {
            // We expect the most common failure cause to be a bad MIME type for the binary,
            // in which case falling back to ArrayBuffer instantiation should work.
            err('wasm streaming compile failed: ' + reason);
            err('falling back to ArrayBuffer instantiation');
            return instantiateArrayBuffer(receiveInstantiationResult);
          });
      });
    } else {
      return instantiateArrayBuffer(receiveInstantiationResult);
    }
  }

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
  // to any other async startup actions they are performing.
  // Also pthreads and wasm workers initialize the wasm instance through this path.
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance);
      return exports;
    } catch(e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
        return false;
    }
  }

  instantiateAsync();
  return {}; // no exports yet; we'll fill them in later
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// === Body ===

var ASM_CONSTS = {
  20274: ($0, $1) => { var self = Module['getCache'](Module['JSContactListener'])[$0]; if (!self.hasOwnProperty('BeginContact')) throw 'a JSImplementation must implement all functions, you forgot JSContactListener::BeginContact.'; self['BeginContact']($1); },  
 20512: ($0, $1) => { var self = Module['getCache'](Module['JSContactListener'])[$0]; if (!self.hasOwnProperty('EndContact')) throw 'a JSImplementation must implement all functions, you forgot JSContactListener::EndContact.'; self['EndContact']($1); },  
 20744: ($0, $1, $2) => { var self = Module['getCache'](Module['JSContactListener'])[$0]; if (!self.hasOwnProperty('PreSolve')) throw 'a JSImplementation must implement all functions, you forgot JSContactListener::PreSolve.'; self['PreSolve']($1,$2); },  
 20973: ($0, $1, $2) => { var self = Module['getCache'](Module['JSContactListener'])[$0]; if (!self.hasOwnProperty('PostSolve')) throw 'a JSImplementation must implement all functions, you forgot JSContactListener::PostSolve.'; self['PostSolve']($1,$2); },  
 21205: ($0, $1, $2, $3, $4) => { var self = Module['getCache'](Module['JSRayCastCallback'])[$0]; if (!self.hasOwnProperty('ReportFixture')) throw 'a JSImplementation must implement all functions, you forgot JSRayCastCallback::ReportFixture.'; return self['ReportFixture']($1,$2,$3,$4); },  
 21462: ($0, $1) => { var self = Module['getCache'](Module['JSQueryCallback'])[$0]; if (!self.hasOwnProperty('ReportFixture')) throw 'a JSImplementation must implement all functions, you forgot JSQueryCallback::ReportFixture.'; return self['ReportFixture']($1); },  
 21706: ($0, $1, $2) => { var self = Module['getCache'](Module['JSContactFilter'])[$0]; if (!self.hasOwnProperty('ShouldCollide')) throw 'a JSImplementation must implement all functions, you forgot JSContactFilter::ShouldCollide.'; return self['ShouldCollide']($1,$2); },  
 21953: ($0, $1) => { var self = Module['getCache'](Module['JSDestructionListener'])[$0]; if (!self.hasOwnProperty('SayGoodbyeJoint')) throw 'a JSImplementation must implement all functions, you forgot JSDestructionListener::SayGoodbyeJoint.'; self['SayGoodbyeJoint']($1); },  
 22208: ($0, $1) => { var self = Module['getCache'](Module['JSDestructionListener'])[$0]; if (!self.hasOwnProperty('SayGoodbyeFixture')) throw 'a JSImplementation must implement all functions, you forgot JSDestructionListener::SayGoodbyeFixture.'; self['SayGoodbyeFixture']($1); },  
 22469: ($0, $1, $2, $3) => { var self = Module['getCache'](Module['JSDraw'])[$0]; if (!self.hasOwnProperty('DrawPolygon')) throw 'a JSImplementation must implement all functions, you forgot JSDraw::DrawPolygon.'; self['DrawPolygon']($1,$2,$3); },  
 22688: ($0, $1, $2, $3) => { var self = Module['getCache'](Module['JSDraw'])[$0]; if (!self.hasOwnProperty('DrawSolidPolygon')) throw 'a JSImplementation must implement all functions, you forgot JSDraw::DrawSolidPolygon.'; self['DrawSolidPolygon']($1,$2,$3); },  
 22922: ($0, $1, $2, $3) => { var self = Module['getCache'](Module['JSDraw'])[$0]; if (!self.hasOwnProperty('DrawCircle')) throw 'a JSImplementation must implement all functions, you forgot JSDraw::DrawCircle.'; self['DrawCircle']($1,$2,$3); },  
 23138: ($0, $1, $2, $3, $4) => { var self = Module['getCache'](Module['JSDraw'])[$0]; if (!self.hasOwnProperty('DrawSolidCircle')) throw 'a JSImplementation must implement all functions, you forgot JSDraw::DrawSolidCircle.'; self['DrawSolidCircle']($1,$2,$3,$4); },  
 23372: ($0, $1, $2, $3) => { var self = Module['getCache'](Module['JSDraw'])[$0]; if (!self.hasOwnProperty('DrawSegment')) throw 'a JSImplementation must implement all functions, you forgot JSDraw::DrawSegment.'; self['DrawSegment']($1,$2,$3); },  
 23591: ($0, $1) => { var self = Module['getCache'](Module['JSDraw'])[$0]; if (!self.hasOwnProperty('DrawTransform')) throw 'a JSImplementation must implement all functions, you forgot JSDraw::DrawTransform.'; self['DrawTransform']($1); },  
 23810: ($0, $1, $2, $3) => { var self = Module['getCache'](Module['JSDraw'])[$0]; if (!self.hasOwnProperty('DrawPoint')) throw 'a JSImplementation must implement all functions, you forgot JSDraw::DrawPoint.'; self['DrawPoint']($1,$2,$3); }
};
function array_bounds_check_error(idx,size) { throw 'Array index ' + idx + ' out of bounds: [0,' + size + ')'; }





  /** @constructor */
  function ExitStatus(status) {
      this.name = 'ExitStatus';
      this.message = 'Program terminated with exit(' + status + ')';
      this.status = status;
    }

  function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        // Pass the module as the first argument.
        callbacks.shift()(Module);
      }
    }

  function withStackSave(f) {
      var stack = stackSave();
      var ret = f();
      stackRestore(stack);
      return ret;
    }
  function demangle(func) {
      warnOnce('warning: build with -sDEMANGLE_SUPPORT to link in libcxxabi demangling');
      return func;
    }

  function demangleAll(text) {
      var regex =
        /\b_Z[\w\d_]+/g;
      return text.replace(regex,
        function(x) {
          var y = demangle(x);
          return x === y ? x : (y + ' [' + x + ']');
        });
    }

  
    /**
     * @param {number} ptr
     * @param {string} type
     */
  function getValue(ptr, type = 'i8') {
      if (type.endsWith('*')) type = '*';
      switch (type) {
        case 'i1': return HEAP8[((ptr)>>0)];
        case 'i8': return HEAP8[((ptr)>>0)];
        case 'i16': return HEAP16[((ptr)>>1)];
        case 'i32': return HEAP32[((ptr)>>2)];
        case 'i64': return HEAP32[((ptr)>>2)];
        case 'float': return HEAPF32[((ptr)>>2)];
        case 'double': return HEAPF64[((ptr)>>3)];
        case '*': return HEAPU32[((ptr)>>2)];
        default: abort('invalid type for getValue: ' + type);
      }
      return null;
    }

  function handleException(e) {
      // Certain exception types we do not treat as errors since they are used for
      // internal control flow.
      // 1. ExitStatus, which is thrown by exit()
      // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
      //    that wish to return to JS event loop.
      if (e instanceof ExitStatus || e == 'unwind') {
        return EXITSTATUS;
      }
      quit_(1, e);
    }

  function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        // IE10+ special cases: It does have callstack info, but it is only
        // populated if an Error object is thrown, so try that as a special-case.
        try {
          throw new Error();
        } catch(e) {
          error = e;
        }
        if (!error.stack) {
          return '(no stack trace available)';
        }
      }
      return error.stack.toString();
    }

  
    /**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */
  function setValue(ptr, value, type = 'i8') {
      if (type.endsWith('*')) type = '*';
      switch (type) {
        case 'i1': HEAP8[((ptr)>>0)] = value; break;
        case 'i8': HEAP8[((ptr)>>0)] = value; break;
        case 'i16': HEAP16[((ptr)>>1)] = value; break;
        case 'i32': HEAP32[((ptr)>>2)] = value; break;
        case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)] = tempI64[0],HEAP32[(((ptr)+(4))>>2)] = tempI64[1]); break;
        case 'float': HEAPF32[((ptr)>>2)] = value; break;
        case 'double': HEAPF64[((ptr)>>3)] = value; break;
        case '*': HEAPU32[((ptr)>>2)] = value; break;
        default: abort('invalid type for setValue: ' + type);
      }
    }

  function stackTrace() {
      var js = jsStackTrace();
      if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
      return demangleAll(js);
    }

  function warnOnce(text) {
      if (!warnOnce.shown) warnOnce.shown = {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        if (ENVIRONMENT_IS_NODE) text = 'warning: ' + text;
        err(text);
      }
    }

  function writeArrayToMemory(array, buffer) {
      assert(array.length >= 0, 'writeArrayToMemory array must have a length (should be an array or typed array)')
      HEAP8.set(array, buffer);
    }

  function ___assert_fail(condition, filename, line, func) {
      abort('Assertion failed: ' + UTF8ToString(condition) + ', at: ' + [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']);
    }

  function setErrNo(value) {
      HEAP32[((___errno_location())>>2)] = value;
      return value;
    }
  
  var PATH = {isAbs:(path) => path.charAt(0) === '/',splitPath:(filename) => {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:(parts, allowAboveRoot) => {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up; up--) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:(path) => {
        var isAbsolute = PATH.isAbs(path),
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter((p) => !!p), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:(path) => {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:(path) => {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        path = PATH.normalize(path);
        path = path.replace(/\/$/, "");
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },join:function() {
        var paths = Array.prototype.slice.call(arguments);
        return PATH.normalize(paths.join('/'));
      },join2:(l, r) => {
        return PATH.normalize(l + '/' + r);
      }};
  
  function getRandomDevice() {
      if (typeof crypto == 'object' && typeof crypto['getRandomValues'] == 'function') {
        // for modern web browsers
        var randomBuffer = new Uint8Array(1);
        return () => { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; };
      } else
      if (ENVIRONMENT_IS_NODE) {
        // for nodejs with or without crypto support included
        try {
          var crypto_module = require('crypto');
          // nodejs has crypto support
          return () => crypto_module['randomBytes'](1)[0];
        } catch (e) {
          // nodejs doesn't have crypto support
        }
      }
      // we couldn't find a proper implementation, as Math.random() is not suitable for /dev/random, see emscripten-core/emscripten/pull/7096
      return () => abort("no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: function(array) { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };");
    }
  
  var PATH_FS = {resolve:function() {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path != 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = PATH.isAbs(path);
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter((p) => !!p), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:(from, to) => {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  /** @type {function(string, boolean=, number=)} */
  function intArrayFromString(stringy, dontAddNull, length) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
    var u8array = new Array(len);
    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull) u8array.length = numBytesWritten;
    return u8array;
  }
  var TTY = {ttys:[],init:function () {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function() {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function(dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function(stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(43);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function(stream) {
          // flush any pending line data
          stream.tty.ops.fsync(stream.tty);
        },fsync:function(stream) {
          stream.tty.ops.fsync(stream.tty);
        },read:function(stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(60);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(6);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function(stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(60);
          }
          try {
            for (var i = 0; i < length; i++) {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            }
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function(tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              // we will read data by chunks of BUFSIZE
              var BUFSIZE = 256;
              var buf = Buffer.alloc(BUFSIZE);
              var bytesRead = 0;
  
              try {
                bytesRead = fs.readSync(process.stdin.fd, buf, 0, BUFSIZE, -1);
              } catch(e) {
                // Cross-platform differences: on Windows, reading EOF throws an exception, but on other OSes,
                // reading EOF returns 0. Uniformize behavior by treating the EOF exception to return 0.
                if (e.toString().includes('EOF')) bytesRead = 0;
                else throw e;
              }
  
              if (bytesRead > 0) {
                result = buf.slice(0, bytesRead).toString('utf-8');
              } else {
                result = null;
              }
            } else
            if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function(tty, val) {
          if (val === null || val === 10) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
          }
        },fsync:function(tty) {
          if (tty.output && tty.output.length > 0) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }},default_tty1_ops:{put_char:function(tty, val) {
          if (val === null || val === 10) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },fsync:function(tty) {
          if (tty.output && tty.output.length > 0) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }}};
  
  function zeroMemory(address, size) {
      HEAPU8.fill(0, address, address + size);
      return address;
    }
  
  function alignMemory(size, alignment) {
      assert(alignment, "alignment argument is required");
      return Math.ceil(size / alignment) * alignment;
    }
  function mmapAlloc(size) {
      abort('internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported');
    }
  var MEMFS = {ops_table:null,mount:function(mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function(parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(63);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap,
                msync: MEMFS.stream_ops.msync
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            }
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
          parent.timestamp = node.timestamp;
        }
        return node;
      },getFileDataAsTypedArray:function(node) {
        if (!node.contents) return new Uint8Array(0);
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },expandFileStorage:function(node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
        // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
        // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
        // avoid overshooting the allocation cap by a very large margin.
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) >>> 0);
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity); // Allocate new storage.
        if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
      },resizeFileStorage:function(node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
        } else {
          var oldContents = node.contents;
          node.contents = new Uint8Array(newSize); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
        }
      },node_ops:{getattr:function(node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function(node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },lookup:function(parent, name) {
          throw FS.genericErrors[44];
        },mknod:function(parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function(old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(55);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.parent.timestamp = Date.now()
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          new_dir.timestamp = old_node.parent.timestamp;
          old_node.parent = new_dir;
        },unlink:function(parent, name) {
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },rmdir:function(parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(55);
          }
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },readdir:function(node) {
          var entries = ['.', '..'];
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function(parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function(node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(28);
          }
          return node.link;
        }},stream_ops:{read:function(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },write:function(stream, buffer, offset, length, position, canOwn) {
          // The data buffer should be a typed array view
          assert(!(buffer instanceof ArrayBuffer));
  
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) {
              assert(position === 0, 'canOwn must imply no weird position inside the file');
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = buffer.slice(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
  
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) {
            // Use typed array write which is available.
            node.contents.set(buffer.subarray(offset, offset + length), position);
          } else {
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          }
          node.usedBytes = Math.max(node.usedBytes, position + length);
          return length;
        },llseek:function(stream, offset, whence) {
          var position = offset;
          if (whence === 1) {
            position += stream.position;
          } else if (whence === 2) {
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(28);
          }
          return position;
        },allocate:function(stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },mmap:function(stream, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if (!(flags & 2) && contents.buffer === buffer) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = mmapAlloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(48);
            }
            HEAP8.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        },msync:function(stream, buffer, offset, length, mmapFlags) {
          MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
          // should we check if bytesWritten and length are the same?
          return 0;
        }}};
  
  /** @param {boolean=} noRunDep */
  function asyncLoad(url, onload, onerror, noRunDep) {
      var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : '';
      readAsync(url, (arrayBuffer) => {
        assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
        onload(new Uint8Array(arrayBuffer));
        if (dep) removeRunDependency(dep);
      }, (event) => {
        if (onerror) {
          onerror();
        } else {
          throw 'Loading data file "' + url + '" failed.';
        }
      });
      if (dep) addRunDependency(dep);
    }
  
  var ERRNO_MESSAGES = {0:"Success",1:"Arg list too long",2:"Permission denied",3:"Address already in use",4:"Address not available",5:"Address family not supported by protocol family",6:"No more processes",7:"Socket already connected",8:"Bad file number",9:"Trying to read unreadable message",10:"Mount device busy",11:"Operation canceled",12:"No children",13:"Connection aborted",14:"Connection refused",15:"Connection reset by peer",16:"File locking deadlock error",17:"Destination address required",18:"Math arg out of domain of func",19:"Quota exceeded",20:"File exists",21:"Bad address",22:"File too large",23:"Host is unreachable",24:"Identifier removed",25:"Illegal byte sequence",26:"Connection already in progress",27:"Interrupted system call",28:"Invalid argument",29:"I/O error",30:"Socket is already connected",31:"Is a directory",32:"Too many symbolic links",33:"Too many open files",34:"Too many links",35:"Message too long",36:"Multihop attempted",37:"File or path name too long",38:"Network interface is not configured",39:"Connection reset by network",40:"Network is unreachable",41:"Too many open files in system",42:"No buffer space available",43:"No such device",44:"No such file or directory",45:"Exec format error",46:"No record locks available",47:"The link has been severed",48:"Not enough core",49:"No message of desired type",50:"Protocol not available",51:"No space left on device",52:"Function not implemented",53:"Socket is not connected",54:"Not a directory",55:"Directory not empty",56:"State not recoverable",57:"Socket operation on non-socket",59:"Not a typewriter",60:"No such device or address",61:"Value too large for defined data type",62:"Previous owner died",63:"Not super-user",64:"Broken pipe",65:"Protocol error",66:"Unknown protocol",67:"Protocol wrong type for socket",68:"Math result not representable",69:"Read only file system",70:"Illegal seek",71:"No such process",72:"Stale file handle",73:"Connection timed out",74:"Text file busy",75:"Cross-device link",100:"Device not a stream",101:"Bad font file fmt",102:"Invalid slot",103:"Invalid request code",104:"No anode",105:"Block device required",106:"Channel number out of range",107:"Level 3 halted",108:"Level 3 reset",109:"Link number out of range",110:"Protocol driver not attached",111:"No CSI structure available",112:"Level 2 halted",113:"Invalid exchange",114:"Invalid request descriptor",115:"Exchange full",116:"No data (for no delay io)",117:"Timer expired",118:"Out of streams resources",119:"Machine is not on the network",120:"Package not installed",121:"The object is remote",122:"Advertise error",123:"Srmount error",124:"Communication error on send",125:"Cross mount point (not really error)",126:"Given log. name not unique",127:"f.d. invalid for this operation",128:"Remote address changed",129:"Can   access a needed shared lib",130:"Accessing a corrupted shared lib",131:".lib section in a.out corrupted",132:"Attempting to link in too many libs",133:"Attempting to exec a shared library",135:"Streams pipe error",136:"Too many users",137:"Socket type not supported",138:"Not supported",139:"Protocol family not supported",140:"Can't send after socket shutdown",141:"Too many references",142:"Host is down",148:"No medium (in tape drive)",156:"Level 2 not synchronized"};
  
  var ERRNO_CODES = {};
  var FS = {root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},filesystems:null,syncFSRequests:0,lookupPath:(path, opts = {}) => {
        path = PATH_FS.resolve(FS.cwd(), path);
  
        if (!path) return { path: '', node: null };
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        opts = Object.assign(defaults, opts)
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(32);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter((p) => !!p), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
  
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count + 1 });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(32);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:(node) => {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:(parentid, name) => {
        var hash = 0;
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:(node) => {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:(node) => {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:(parent, name) => {
        var errCode = FS.mayLookup(parent);
        if (errCode) {
          throw new FS.ErrnoError(errCode, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:(parent, name, mode, rdev) => {
        assert(typeof parent == 'object')
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:(node) => {
        FS.hashRemoveNode(node);
      },isRoot:(node) => {
        return node === node.parent;
      },isMountpoint:(node) => {
        return !!node.mounted;
      },isFile:(mode) => {
        return (mode & 61440) === 32768;
      },isDir:(mode) => {
        return (mode & 61440) === 16384;
      },isLink:(mode) => {
        return (mode & 61440) === 40960;
      },isChrdev:(mode) => {
        return (mode & 61440) === 8192;
      },isBlkdev:(mode) => {
        return (mode & 61440) === 24576;
      },isFIFO:(mode) => {
        return (mode & 61440) === 4096;
      },isSocket:(mode) => {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"r+":2,"w":577,"w+":578,"a":1089,"a+":1090},modeStringToFlags:(str) => {
        var flags = FS.flagModes[str];
        if (typeof flags == 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:(flag) => {
        var perms = ['r', 'w', 'rw'][flag & 3];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:(node, perms) => {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.includes('r') && !(node.mode & 292)) {
          return 2;
        } else if (perms.includes('w') && !(node.mode & 146)) {
          return 2;
        } else if (perms.includes('x') && !(node.mode & 73)) {
          return 2;
        }
        return 0;
      },mayLookup:(dir) => {
        var errCode = FS.nodePermissions(dir, 'x');
        if (errCode) return errCode;
        if (!dir.node_ops.lookup) return 2;
        return 0;
      },mayCreate:(dir, name) => {
        try {
          var node = FS.lookupNode(dir, name);
          return 20;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:(dir, name, isdir) => {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var errCode = FS.nodePermissions(dir, 'wx');
        if (errCode) {
          return errCode;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return 54;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return 10;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return 31;
          }
        }
        return 0;
      },mayOpen:(node, flags) => {
        if (!node) {
          return 44;
        }
        if (FS.isLink(node.mode)) {
          return 32;
        } else if (FS.isDir(node.mode)) {
          if (FS.flagsToPermissionString(flags) !== 'r' || // opening for write
              (flags & 512)) { // TODO: check for O_SEARCH? (== search for dir only)
            return 31;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:(fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(33);
      },getStream:(fd) => FS.streams[fd],createStream:(stream, fd_start, fd_end) => {
        if (!FS.FSStream) {
          FS.FSStream = /** @constructor */ function() {
            this.shared = { };
          };
          FS.FSStream.prototype = {};
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              /** @this {FS.FSStream} */
              get: function() { return this.node; },
              /** @this {FS.FSStream} */
              set: function(val) { this.node = val; }
            },
            isRead: {
              /** @this {FS.FSStream} */
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              /** @this {FS.FSStream} */
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              /** @this {FS.FSStream} */
              get: function() { return (this.flags & 1024); }
            },
            flags: {
              /** @this {FS.FSStream} */
              get: function() { return this.shared.flags; },
              /** @this {FS.FSStream} */
              set: function(val) { this.shared.flags = val; },
            },
            position : {
              /** @this {FS.FSStream} */
              get: function() { return this.shared.position; },
              /** @this {FS.FSStream} */
              set: function(val) { this.shared.position = val; },
            },
          });
        }
        // clone it, so we can return an instance of FSStream
        stream = Object.assign(new FS.FSStream(), stream);
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:(fd) => {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:(stream) => {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:() => {
          throw new FS.ErrnoError(70);
        }},major:(dev) => ((dev) >> 8),minor:(dev) => ((dev) & 0xff),makedev:(ma, mi) => ((ma) << 8 | (mi)),registerDevice:(dev, ops) => {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:(dev) => FS.devices[dev],getMounts:(mount) => {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:(populate, callback) => {
        if (typeof populate == 'function') {
          callback = populate;
          populate = false;
        }
  
        FS.syncFSRequests++;
  
        if (FS.syncFSRequests > 1) {
          err('warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work');
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function doCallback(errCode) {
          assert(FS.syncFSRequests > 0);
          FS.syncFSRequests--;
          return callback(errCode);
        }
  
        function done(errCode) {
          if (errCode) {
            if (!done.errored) {
              done.errored = true;
              return doCallback(errCode);
            }
            return;
          }
          if (++completed >= mounts.length) {
            doCallback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach((mount) => {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:(type, opts, mountpoint) => {
        if (typeof type == 'string') {
          // The filesystem was not included, and instead we have an error
          // message stored in the variable.
          throw type;
        }
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(10);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:(mountpoint) => {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(28);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach((hash) => {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.includes(current.mount)) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:(parent, name) => {
        return parent.node_ops.lookup(parent, name);
      },mknod:(path, mode, dev) => {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.mayCreate(parent, name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:(path, mode) => {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:(path, mode) => {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdirTree:(path, mode) => {
        var dirs = path.split('/');
        var d = '';
        for (var i = 0; i < dirs.length; ++i) {
          if (!dirs[i]) continue;
          d += '/' + dirs[i];
          try {
            FS.mkdir(d, mode);
          } catch(e) {
            if (e.errno != 20) throw e;
          }
        }
      },mkdev:(path, mode, dev) => {
        if (typeof dev == 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:(oldpath, newpath) => {
        if (!PATH_FS.resolve(oldpath)) {
          throw new FS.ErrnoError(44);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var newname = PATH.basename(newpath);
        var errCode = FS.mayCreate(parent, newname);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:(old_path, new_path) => {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
  
        // let the errors from non existant directories percolate up
        lookup = FS.lookupPath(old_path, { parent: true });
        old_dir = lookup.node;
        lookup = FS.lookupPath(new_path, { parent: true });
        new_dir = lookup.node;
  
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(75);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(28);
        }
        // new path should not be an ancestor of the old path
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(55);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        errCode = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(10);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          errCode = FS.nodePermissions(old_dir, 'w');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:(path) => {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:(path) => {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(54);
        }
        return node.node_ops.readdir(node);
      },unlink:(path) => {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
          // According to POSIX, we should map EISDIR to EPERM, but
          // we instead do what Linux does (and we must, as we use
          // the musl linux libc).
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:(path) => {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(44);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(28);
        }
        return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
      },stat:(path, dontFollow) => {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(63);
        }
        return node.node_ops.getattr(node);
      },lstat:(path) => {
        return FS.stat(path, true);
      },chmod:(path, mode, dontFollow) => {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:(path, mode) => {
        FS.chmod(path, mode, true);
      },fchmod:(fd, mode) => {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        FS.chmod(stream.node, mode);
      },chown:(path, uid, gid, dontFollow) => {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:(path, uid, gid) => {
        FS.chown(path, uid, gid, true);
      },fchown:(fd, uid, gid) => {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:(path, len) => {
        if (len < 0) {
          throw new FS.ErrnoError(28);
        }
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.nodePermissions(node, 'w');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:(fd, len) => {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(28);
        }
        FS.truncate(stream.node, len);
      },utime:(path, atime, mtime) => {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:(path, flags, mode) => {
        if (path === "") {
          throw new FS.ErrnoError(44);
        }
        flags = typeof flags == 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode == 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path == 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(20);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // if asked only for a directory, then this must be one
        if ((flags & 65536) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var errCode = FS.mayOpen(node, flags);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // do truncation if necessary
        if ((flags & 512) && !created) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512 | 131072);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        });
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
          }
        }
        return stream;
      },close:(stream) => {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (stream.getdents) stream.getdents = null; // free readdir state
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
        stream.fd = null;
      },isClosed:(stream) => {
        return stream.fd === null;
      },llseek:(stream, offset, whence) => {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(70);
        }
        if (whence != 0 && whence != 1 && whence != 2) {
          throw new FS.ErrnoError(28);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
      },read:(stream, buffer, offset, length, position) => {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(28);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:(stream, buffer, offset, length, position, canOwn) => {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(28);
        }
        if (stream.seekable && stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:(stream, offset, length) => {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(28);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(138);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:(stream, length, position, prot, flags) => {
        // User requests writing to file (prot & PROT_WRITE != 0).
        // Checking if we have permissions to write to the file unless
        // MAP_PRIVATE flag is set. According to POSIX spec it is possible
        // to write to file opened in read-only mode with MAP_PRIVATE flag,
        // as all modifications will be visible only in the memory of
        // the current process.
        if ((prot & 2) !== 0
            && (flags & 2) === 0
            && (stream.flags & 2097155) !== 2) {
          throw new FS.ErrnoError(2);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(2);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(43);
        }
        return stream.stream_ops.mmap(stream, length, position, prot, flags);
      },msync:(stream, buffer, offset, length, mmapFlags) => {
        if (!stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
      },munmap:(stream) => 0,ioctl:(stream, cmd, arg) => {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(59);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:(path, opts = {}) => {
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = UTF8ArrayToString(buf, 0);
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:(path, data, opts = {}) => {
        opts.flags = opts.flags || 577;
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data == 'string') {
          var buf = new Uint8Array(lengthBytesUTF8(data)+1);
          var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
          FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
          FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
          throw new Error('Unsupported data type');
        }
        FS.close(stream);
      },cwd:() => FS.currentPath,chdir:(path) => {
        var lookup = FS.lookupPath(path, { follow: true });
        if (lookup.node === null) {
          throw new FS.ErrnoError(44);
        }
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(54);
        }
        var errCode = FS.nodePermissions(lookup.node, 'x');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:() => {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },createDefaultDevices:() => {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: () => 0,
          write: (stream, buffer, offset, length, pos) => length,
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using err() rather than out()
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        var random_device = getRandomDevice();
        FS.createDevice('/dev', 'random', random_device);
        FS.createDevice('/dev', 'urandom', random_device);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createSpecialDirectories:() => {
        // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
        // name of the stream for fd 6 (see test_unistd_ttyname)
        FS.mkdir('/proc');
        var proc_self = FS.mkdir('/proc/self');
        FS.mkdir('/proc/self/fd');
        FS.mount({
          mount: () => {
            var node = FS.createNode(proc_self, 'fd', 16384 | 511 /* 0777 */, 73);
            node.node_ops = {
              lookup: (parent, name) => {
                var fd = +name;
                var stream = FS.getStream(fd);
                if (!stream) throw new FS.ErrnoError(8);
                var ret = {
                  parent: null,
                  mount: { mountpoint: 'fake' },
                  node_ops: { readlink: () => stream.path },
                };
                ret.parent = ret; // make it look like a simple root node
                return ret;
              }
            };
            return node;
          }
        }, {}, '/proc/self/fd');
      },createStandardStreams:() => {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 0);
        var stdout = FS.open('/dev/stdout', 1);
        var stderr = FS.open('/dev/stderr', 1);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:() => {
        if (FS.ErrnoError) return;
        FS.ErrnoError = /** @this{Object} */ function ErrnoError(errno, node) {
          this.node = node;
          this.setErrno = /** @this{Object} */ function(errno) {
            this.errno = errno;
            for (var key in ERRNO_CODES) {
              if (ERRNO_CODES[key] === errno) {
                this.code = key;
                break;
              }
            }
          };
          this.setErrno(errno);
          this.message = ERRNO_MESSAGES[errno];
  
          // Try to get a maximally helpful stack trace. On Node.js, getting Error.stack
          // now ensures it shows what we want.
          if (this.stack) {
            // Define the stack property for Node.js 4, which otherwise errors on the next line.
            Object.defineProperty(this, "stack", { value: (new Error).stack, writable: true });
            this.stack = demangleAll(this.stack);
          }
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [44].forEach((code) => {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:() => {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
  
        FS.filesystems = {
          'MEMFS': MEMFS,
        };
      },init:(input, output, error) => {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:() => {
        FS.init.initialized = false;
        // force-flush all streams, so we get musl std streams printed out
        _fflush(0);
        // close all of our streams
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:(canRead, canWrite) => {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },findObject:(path, dontResolveLastLink) => {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (!ret.exists) {
          return null;
        }
        return ret.object;
      },analyzePath:(path, dontResolveLastLink) => {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createPath:(parent, path, canRead, canWrite) => {
        parent = typeof parent == 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:(parent, name, properties, canRead, canWrite) => {
        var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:(parent, name, data, canRead, canWrite, canOwn) => {
        var path = name;
        if (parent) {
          parent = typeof parent == 'string' ? parent : FS.getPath(parent);
          path = name ? PATH.join2(parent, name) : parent;
        }
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data == 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 577);
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:(parent, name, input, output) => {
        var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: (stream) => {
            stream.seekable = false;
          },
          close: (stream) => {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: (stream, buffer, offset, length, pos /* ignored */) => {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(6);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: (stream, buffer, offset, length, pos) => {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },forceLoadFile:(obj) => {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        if (typeof XMLHttpRequest != 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (read_) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(read_(obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
      },createLazyFile:(parent, name, url, canRead, canWrite) => {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        /** @constructor */
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = /** @this{Object} */ function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = (idx / this.chunkSize)|0;
          return this.getter(chunkNum)[chunkOffset];
        };
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        };
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
  
          var chunkSize = 1024*1024; // Chunk size in bytes
  
          if (!hasByteServing) chunkSize = datalength;
  
          // Function to get a range from the remote URL.
          var doXHR = (from, to) => {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
            // Some hints to the browser that we want binary data.
            xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
  
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(/** @type{Array<number>} */(xhr.response || []));
            }
            return intArrayFromString(xhr.responseText || '', true);
          };
          var lazyArray = this;
          lazyArray.setDataGetter((chunkNum) => {
            var start = chunkNum * chunkSize;
            var end = (chunkNum+1) * chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof lazyArray.chunks[chunkNum] == 'undefined') {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof lazyArray.chunks[chunkNum] == 'undefined') throw new Error('doXHR failed!');
            return lazyArray.chunks[chunkNum];
          });
  
          if (usesGzip || !datalength) {
            // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
            chunkSize = datalength = 1; // this will force getter(0)/doXHR do download the whole file
            datalength = this.getter(0).length;
            chunkSize = datalength;
            out("LazyFiles on gzip forces download of the whole file when length is accessed");
          }
  
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        };
        if (typeof XMLHttpRequest != 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperties(lazyArray, {
            length: {
              get: /** @this{Object} */ function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._length;
              }
            },
            chunkSize: {
              get: /** @this{Object} */ function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._chunkSize;
              }
            }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperties(node, {
          usedBytes: {
            get: /** @this {FSNode} */ function() { return this.contents.length; }
          }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach((key) => {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            FS.forceLoadFile(node);
            return fn.apply(null, arguments);
          };
        });
        function writeChunks(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        }
        // use a custom read function
        stream_ops.read = (stream, buffer, offset, length, position) => {
          FS.forceLoadFile(node);
          return writeChunks(stream, buffer, offset, length, position)
        };
        // use a custom mmap function
        stream_ops.mmap = (stream, length, position, prot, flags) => {
          FS.forceLoadFile(node);
          var ptr = mmapAlloc(length);
          if (!ptr) {
            throw new FS.ErrnoError(48);
          }
          writeChunks(stream, HEAP8, ptr, length, position);
          return { ptr: ptr, allocated: true };
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency('cp ' + fullname); // might have several active requests for the same fullname
        function processData(byteArray) {
          function finish(byteArray) {
            if (preFinish) preFinish();
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency(dep);
          }
          if (Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
            if (onerror) onerror();
            removeRunDependency(dep);
          })) {
            return;
          }
          finish(byteArray);
        }
        addRunDependency(dep);
        if (typeof url == 'string') {
          asyncLoad(url, (byteArray) => processData(byteArray), onerror);
        } else {
          processData(url);
        }
      },indexedDB:() => {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:() => {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:(paths, onload, onerror) => {
        onload = onload || (() => {});
        onerror = onerror || (() => {});
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = () => {
          out('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = () => {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach((path) => {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = () => { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = () => { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:(paths, onload, onerror) => {
        onload = onload || (() => {});
        onerror = onerror || (() => {});
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = () => {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach((path) => {
            var getRequest = files.get(path);
            getRequest.onsuccess = () => {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = () => { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },absolutePath:() => {
        abort('FS.absolutePath has been removed; use PATH_FS.resolve instead');
      },createFolder:() => {
        abort('FS.createFolder has been removed; use FS.mkdir instead');
      },createLink:() => {
        abort('FS.createLink has been removed; use FS.symlink instead');
      },joinPath:() => {
        abort('FS.joinPath has been removed; use PATH.join instead');
      },mmapAlloc:() => {
        abort('FS.mmapAlloc has been replaced by the top level function mmapAlloc');
      },standardizePath:() => {
        abort('FS.standardizePath has been removed; use PATH.normalize instead');
      }};
  var SYSCALLS = {DEFAULT_POLLMASK:5,calculateAt:function(dirfd, path, allowEmpty) {
        if (PATH.isAbs(path)) {
          return path;
        }
        // relative path
        var dir;
        if (dirfd === -100) {
          dir = FS.cwd();
        } else {
          var dirstream = SYSCALLS.getStreamFromFD(dirfd);
          dir = dirstream.path;
        }
        if (path.length == 0) {
          if (!allowEmpty) {
            throw new FS.ErrnoError(44);;
          }
          return dir;
        }
        return PATH.join2(dir, path);
      },doStat:function(func, path, buf) {
        try {
          var stat = func(path);
        } catch (e) {
          if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
            // an error occurred while trying to look up the path; we should just report ENOTDIR
            return -54;
          }
          throw e;
        }
        HEAP32[((buf)>>2)] = stat.dev;
        HEAP32[(((buf)+(8))>>2)] = stat.ino;
        HEAP32[(((buf)+(12))>>2)] = stat.mode;
        HEAPU32[(((buf)+(16))>>2)] = stat.nlink;
        HEAP32[(((buf)+(20))>>2)] = stat.uid;
        HEAP32[(((buf)+(24))>>2)] = stat.gid;
        HEAP32[(((buf)+(28))>>2)] = stat.rdev;
        (tempI64 = [stat.size>>>0,(tempDouble=stat.size,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(40))>>2)] = tempI64[0],HEAP32[(((buf)+(44))>>2)] = tempI64[1]);
        HEAP32[(((buf)+(48))>>2)] = 4096;
        HEAP32[(((buf)+(52))>>2)] = stat.blocks;
        (tempI64 = [Math.floor(stat.atime.getTime() / 1000)>>>0,(tempDouble=Math.floor(stat.atime.getTime() / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(56))>>2)] = tempI64[0],HEAP32[(((buf)+(60))>>2)] = tempI64[1]);
        HEAPU32[(((buf)+(64))>>2)] = 0;
        (tempI64 = [Math.floor(stat.mtime.getTime() / 1000)>>>0,(tempDouble=Math.floor(stat.mtime.getTime() / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(72))>>2)] = tempI64[0],HEAP32[(((buf)+(76))>>2)] = tempI64[1]);
        HEAPU32[(((buf)+(80))>>2)] = 0;
        (tempI64 = [Math.floor(stat.ctime.getTime() / 1000)>>>0,(tempDouble=Math.floor(stat.ctime.getTime() / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(88))>>2)] = tempI64[0],HEAP32[(((buf)+(92))>>2)] = tempI64[1]);
        HEAPU32[(((buf)+(96))>>2)] = 0;
        (tempI64 = [stat.ino>>>0,(tempDouble=stat.ino,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(104))>>2)] = tempI64[0],HEAP32[(((buf)+(108))>>2)] = tempI64[1]);
        return 0;
      },doMsync:function(addr, stream, len, flags, offset) {
        if (!FS.isFile(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (flags & 2) {
          // MAP_PRIVATE calls need not to be synced back to underlying fs
          return 0;
        }
        var buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags);
      },varargs:undefined,get:function() {
        assert(SYSCALLS.varargs != undefined);
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(((SYSCALLS.varargs)-(4))>>2)];
        return ret;
      },getStr:function(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },getStreamFromFD:function(fd) {
        var stream = FS.getStream(fd);
        if (!stream) throw new FS.ErrnoError(8);
        return stream;
      }};
  function ___syscall_fcntl64(fd, cmd, varargs) {
  SYSCALLS.varargs = varargs;
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (cmd) {
        case 0: {
          var arg = SYSCALLS.get();
          if (arg < 0) {
            return -28;
          }
          var newStream;
          newStream = FS.createStream(stream, arg);
          return newStream.fd;
        }
        case 1:
        case 2:
          return 0;  // FD_CLOEXEC makes no sense for a single process.
        case 3:
          return stream.flags;
        case 4: {
          var arg = SYSCALLS.get();
          stream.flags |= arg;
          return 0;
        }
        case 5:
        /* case 5: Currently in musl F_GETLK64 has same value as F_GETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */ {
          
          var arg = SYSCALLS.get();
          var offset = 0;
          // We're always unlocked.
          HEAP16[(((arg)+(offset))>>1)] = 2;
          return 0;
        }
        case 6:
        case 7:
        /* case 6: Currently in musl F_SETLK64 has same value as F_SETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */
        /* case 7: Currently in musl F_SETLKW64 has same value as F_SETLKW, so omitted to avoid duplicate case blocks. If that changes, uncomment this */
          
          
          return 0; // Pretend that the locking is successful.
        case 16:
        case 8:
          return -28; // These are for sockets. We don't have them fully implemented yet.
        case 9:
          // musl trusts getown return values, due to a bug where they must be, as they overlap with errors. just return -1 here, so fcntl() returns that, and we set errno ourselves.
          setErrNo(28);
          return -1;
        default: {
          return -28;
        }
      }
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  }

  function ___syscall_ioctl(fd, op, varargs) {
  SYSCALLS.varargs = varargs;
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (op) {
        case 21509:
        case 21505: {
          if (!stream.tty) return -59;
          return 0;
        }
        case 21510:
        case 21511:
        case 21512:
        case 21506:
        case 21507:
        case 21508: {
          if (!stream.tty) return -59;
          return 0; // no-op, not actually adjusting terminal settings
        }
        case 21519: {
          if (!stream.tty) return -59;
          var argp = SYSCALLS.get();
          HEAP32[((argp)>>2)] = 0;
          return 0;
        }
        case 21520: {
          if (!stream.tty) return -59;
          return -28; // not supported
        }
        case 21531: {
          var argp = SYSCALLS.get();
          return FS.ioctl(stream, op, argp);
        }
        case 21523: {
          // TODO: in theory we should write to the winsize struct that gets
          // passed in, but for now musl doesn't read anything on it
          if (!stream.tty) return -59;
          return 0;
        }
        case 21524: {
          // TODO: technically, this ioctl call should change the window size.
          // but, since emscripten doesn't have any concept of a terminal window
          // yet, we'll just silently throw it away as we do TIOCGWINSZ
          if (!stream.tty) return -59;
          return 0;
        }
        default: return -28; // not supported
      }
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  }

  function ___syscall_openat(dirfd, path, flags, varargs) {
  SYSCALLS.varargs = varargs;
  try {
  
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path);
      var mode = varargs ? SYSCALLS.get() : 0;
      return FS.open(path, flags, mode).fd;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  }

  function _abort() {
      abort('native code called abort()');
    }

  var readAsmConstArgsArray = [];
  function readAsmConstArgs(sigPtr, buf) {
      // Nobody should have mutated _readAsmConstArgsArray underneath us to be something else than an array.
      assert(Array.isArray(readAsmConstArgsArray));
      // The input buffer is allocated on the stack, so it must be stack-aligned.
      assert(buf % 16 == 0);
      readAsmConstArgsArray.length = 0;
      var ch;
      // Most arguments are i32s, so shift the buffer pointer so it is a plain
      // index into HEAP32.
      buf >>= 2;
      while (ch = HEAPU8[sigPtr++]) {
        var chr = String.fromCharCode(ch);
        var validChars = ['d', 'f', 'i'];
        assert(validChars.includes(chr), 'Invalid character ' + ch + '("' + chr + '") in readAsmConstArgs! Use only [' + validChars + '], and do not specify "v" for void return argument.');
        // Floats are always passed as doubles, and doubles and int64s take up 8
        // bytes (two 32-bit slots) in memory, align reads to these:
        buf += (ch != 105/*i*/) & buf;
        readAsmConstArgsArray.push(
          ch == 105/*i*/ ? HEAP32[buf] :
         HEAPF64[buf++ >> 1]
        );
        ++buf;
      }
      return readAsmConstArgsArray;
    }
  function _emscripten_asm_const_int(code, sigPtr, argbuf) {
      var args = readAsmConstArgs(sigPtr, argbuf);
      if (!ASM_CONSTS.hasOwnProperty(code)) abort('No EM_ASM constant found at address ' + code);
      return ASM_CONSTS[code].apply(null, args);
    }
  var _emscripten_asm_const_double = _emscripten_asm_const_int;


  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }

  function getHeapMax() {
      return HEAPU8.length;
    }
  
  function abortOnCannotGrowMemory(requestedSize) {
      abort('Cannot enlarge memory arrays to size ' + requestedSize + ' bytes (OOM). Either (1) compile with -sINITIAL_MEMORY=X with X higher than the current value ' + HEAP8.length + ', (2) compile with -sALLOW_MEMORY_GROWTH which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with -sABORTING_MALLOC=0');
    }
  function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      abortOnCannotGrowMemory(requestedSize);
    }

  function _fd_close(fd) {
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.close(stream);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  }

  /** @param {number=} offset */
  function doReadv(stream, iov, iovcnt, offset) {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        var curr = FS.read(stream, HEAP8,ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) break; // nothing more to read
      }
      return ret;
    }
  function _fd_read(fd, iov, iovcnt, pnum) {
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = doReadv(stream, iov, iovcnt);
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  }

  function convertI32PairToI53Checked(lo, hi) {
      assert(lo == (lo >>> 0) || lo == (lo|0)); // lo should either be a i32 or a u32
      assert(hi === (hi|0));                    // hi should be a i32
      return ((hi + 0x200000) >>> 0 < 0x400001 - !!lo) ? (lo >>> 0) + hi * 4294967296 : NaN;
    }
  function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
  try {
  
      var offset = convertI32PairToI53Checked(offset_low, offset_high); if (isNaN(offset)) return 61;
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.llseek(stream, offset, whence);
      (tempI64 = [stream.position>>>0,(tempDouble=stream.position,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((newOffset)>>2)] = tempI64[0],HEAP32[(((newOffset)+(4))>>2)] = tempI64[1]);
      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  }

  /** @param {number=} offset */
  function doWritev(stream, iov, iovcnt, offset) {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        var curr = FS.write(stream, HEAP8,ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
      }
      return ret;
    }
  function _fd_write(fd, iov, iovcnt, pnum) {
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = doWritev(stream, iov, iovcnt);
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  }

  var FSNode = /** @constructor */ function(parent, name, mode, rdev) {
    if (!parent) {
      parent = this;  // root node sets parent to itself
    }
    this.parent = parent;
    this.mount = parent.mount;
    this.mounted = null;
    this.id = FS.nextInode++;
    this.name = name;
    this.mode = mode;
    this.node_ops = {};
    this.stream_ops = {};
    this.rdev = rdev;
  };
  var readMode = 292/*292*/ | 73/*73*/;
  var writeMode = 146/*146*/;
  Object.defineProperties(FSNode.prototype, {
   read: {
    get: /** @this{FSNode} */function() {
     return (this.mode & readMode) === readMode;
    },
    set: /** @this{FSNode} */function(val) {
     val ? this.mode |= readMode : this.mode &= ~readMode;
    }
   },
   write: {
    get: /** @this{FSNode} */function() {
     return (this.mode & writeMode) === writeMode;
    },
    set: /** @this{FSNode} */function(val) {
     val ? this.mode |= writeMode : this.mode &= ~writeMode;
    }
   },
   isFolder: {
    get: /** @this{FSNode} */function() {
     return FS.isDir(this.mode);
    }
   },
   isDevice: {
    get: /** @this{FSNode} */function() {
     return FS.isChrdev(this.mode);
    }
   }
  });
  FS.FSNode = FSNode;
  FS.staticInit();;
ERRNO_CODES = {
      'EPERM': 63,
      'ENOENT': 44,
      'ESRCH': 71,
      'EINTR': 27,
      'EIO': 29,
      'ENXIO': 60,
      'E2BIG': 1,
      'ENOEXEC': 45,
      'EBADF': 8,
      'ECHILD': 12,
      'EAGAIN': 6,
      'EWOULDBLOCK': 6,
      'ENOMEM': 48,
      'EACCES': 2,
      'EFAULT': 21,
      'ENOTBLK': 105,
      'EBUSY': 10,
      'EEXIST': 20,
      'EXDEV': 75,
      'ENODEV': 43,
      'ENOTDIR': 54,
      'EISDIR': 31,
      'EINVAL': 28,
      'ENFILE': 41,
      'EMFILE': 33,
      'ENOTTY': 59,
      'ETXTBSY': 74,
      'EFBIG': 22,
      'ENOSPC': 51,
      'ESPIPE': 70,
      'EROFS': 69,
      'EMLINK': 34,
      'EPIPE': 64,
      'EDOM': 18,
      'ERANGE': 68,
      'ENOMSG': 49,
      'EIDRM': 24,
      'ECHRNG': 106,
      'EL2NSYNC': 156,
      'EL3HLT': 107,
      'EL3RST': 108,
      'ELNRNG': 109,
      'EUNATCH': 110,
      'ENOCSI': 111,
      'EL2HLT': 112,
      'EDEADLK': 16,
      'ENOLCK': 46,
      'EBADE': 113,
      'EBADR': 114,
      'EXFULL': 115,
      'ENOANO': 104,
      'EBADRQC': 103,
      'EBADSLT': 102,
      'EDEADLOCK': 16,
      'EBFONT': 101,
      'ENOSTR': 100,
      'ENODATA': 116,
      'ETIME': 117,
      'ENOSR': 118,
      'ENONET': 119,
      'ENOPKG': 120,
      'EREMOTE': 121,
      'ENOLINK': 47,
      'EADV': 122,
      'ESRMNT': 123,
      'ECOMM': 124,
      'EPROTO': 65,
      'EMULTIHOP': 36,
      'EDOTDOT': 125,
      'EBADMSG': 9,
      'ENOTUNIQ': 126,
      'EBADFD': 127,
      'EREMCHG': 128,
      'ELIBACC': 129,
      'ELIBBAD': 130,
      'ELIBSCN': 131,
      'ELIBMAX': 132,
      'ELIBEXEC': 133,
      'ENOSYS': 52,
      'ENOTEMPTY': 55,
      'ENAMETOOLONG': 37,
      'ELOOP': 32,
      'EOPNOTSUPP': 138,
      'EPFNOSUPPORT': 139,
      'ECONNRESET': 15,
      'ENOBUFS': 42,
      'EAFNOSUPPORT': 5,
      'EPROTOTYPE': 67,
      'ENOTSOCK': 57,
      'ENOPROTOOPT': 50,
      'ESHUTDOWN': 140,
      'ECONNREFUSED': 14,
      'EADDRINUSE': 3,
      'ECONNABORTED': 13,
      'ENETUNREACH': 40,
      'ENETDOWN': 38,
      'ETIMEDOUT': 73,
      'EHOSTDOWN': 142,
      'EHOSTUNREACH': 23,
      'EINPROGRESS': 26,
      'EALREADY': 7,
      'EDESTADDRREQ': 17,
      'EMSGSIZE': 35,
      'EPROTONOSUPPORT': 66,
      'ESOCKTNOSUPPORT': 137,
      'EADDRNOTAVAIL': 4,
      'ENETRESET': 39,
      'EISCONN': 30,
      'ENOTCONN': 53,
      'ETOOMANYREFS': 141,
      'EUSERS': 136,
      'EDQUOT': 19,
      'ESTALE': 72,
      'ENOTSUP': 138,
      'ENOMEDIUM': 148,
      'EILSEQ': 25,
      'EOVERFLOW': 61,
      'ECANCELED': 11,
      'ENOTRECOVERABLE': 56,
      'EOWNERDEAD': 62,
      'ESTRPIPE': 135,
    };;
var ASSERTIONS = true;

function checkIncomingModuleAPI() {
  ignoredModuleProp('fetchSettings');
}
var asmLibraryArg = {
  "__assert_fail": ___assert_fail,
  "__syscall_fcntl64": ___syscall_fcntl64,
  "__syscall_ioctl": ___syscall_ioctl,
  "__syscall_openat": ___syscall_openat,
  "abort": _abort,
  "array_bounds_check_error": array_bounds_check_error,
  "emscripten_asm_const_double": _emscripten_asm_const_double,
  "emscripten_asm_const_int": _emscripten_asm_const_int,
  "emscripten_memcpy_big": _emscripten_memcpy_big,
  "emscripten_resize_heap": _emscripten_resize_heap,
  "fd_close": _fd_close,
  "fd_read": _fd_read,
  "fd_seek": _fd_seek,
  "fd_write": _fd_write
};
var asm = createWasm();
/** @type {function(...*):?} */
var ___wasm_call_ctors = Module["___wasm_call_ctors"] = createExportWrapper("__wasm_call_ctors");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactListener___destroy___0 = Module["_emscripten_bind_b2ContactListener___destroy___0"] = createExportWrapper("emscripten_bind_b2ContactListener___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Shape_GetType_0 = Module["_emscripten_bind_b2Shape_GetType_0"] = createExportWrapper("emscripten_bind_b2Shape_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Shape_GetChildCount_0 = Module["_emscripten_bind_b2Shape_GetChildCount_0"] = createExportWrapper("emscripten_bind_b2Shape_GetChildCount_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Shape_TestPoint_2 = Module["_emscripten_bind_b2Shape_TestPoint_2"] = createExportWrapper("emscripten_bind_b2Shape_TestPoint_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2Shape_RayCast_4 = Module["_emscripten_bind_b2Shape_RayCast_4"] = createExportWrapper("emscripten_bind_b2Shape_RayCast_4");

/** @type {function(...*):?} */
var _emscripten_bind_b2Shape_ComputeAABB_3 = Module["_emscripten_bind_b2Shape_ComputeAABB_3"] = createExportWrapper("emscripten_bind_b2Shape_ComputeAABB_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2Shape_ComputeMass_2 = Module["_emscripten_bind_b2Shape_ComputeMass_2"] = createExportWrapper("emscripten_bind_b2Shape_ComputeMass_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2Shape_get_m_type_0 = Module["_emscripten_bind_b2Shape_get_m_type_0"] = createExportWrapper("emscripten_bind_b2Shape_get_m_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Shape_set_m_type_1 = Module["_emscripten_bind_b2Shape_set_m_type_1"] = createExportWrapper("emscripten_bind_b2Shape_set_m_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Shape_get_m_radius_0 = Module["_emscripten_bind_b2Shape_get_m_radius_0"] = createExportWrapper("emscripten_bind_b2Shape_get_m_radius_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Shape_set_m_radius_1 = Module["_emscripten_bind_b2Shape_set_m_radius_1"] = createExportWrapper("emscripten_bind_b2Shape_set_m_radius_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Shape___destroy___0 = Module["_emscripten_bind_b2Shape___destroy___0"] = createExportWrapper("emscripten_bind_b2Shape___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RayCastCallback___destroy___0 = Module["_emscripten_bind_b2RayCastCallback___destroy___0"] = createExportWrapper("emscripten_bind_b2RayCastCallback___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2QueryCallback___destroy___0 = Module["_emscripten_bind_b2QueryCallback___destroy___0"] = createExportWrapper("emscripten_bind_b2QueryCallback___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointDef_b2JointDef_0 = Module["_emscripten_bind_b2JointDef_b2JointDef_0"] = createExportWrapper("emscripten_bind_b2JointDef_b2JointDef_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointDef_get_type_0 = Module["_emscripten_bind_b2JointDef_get_type_0"] = createExportWrapper("emscripten_bind_b2JointDef_get_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointDef_set_type_1 = Module["_emscripten_bind_b2JointDef_set_type_1"] = createExportWrapper("emscripten_bind_b2JointDef_set_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointDef_get_userData_0 = Module["_emscripten_bind_b2JointDef_get_userData_0"] = createExportWrapper("emscripten_bind_b2JointDef_get_userData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointDef_set_userData_1 = Module["_emscripten_bind_b2JointDef_set_userData_1"] = createExportWrapper("emscripten_bind_b2JointDef_set_userData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointDef_get_bodyA_0 = Module["_emscripten_bind_b2JointDef_get_bodyA_0"] = createExportWrapper("emscripten_bind_b2JointDef_get_bodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointDef_set_bodyA_1 = Module["_emscripten_bind_b2JointDef_set_bodyA_1"] = createExportWrapper("emscripten_bind_b2JointDef_set_bodyA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointDef_get_bodyB_0 = Module["_emscripten_bind_b2JointDef_get_bodyB_0"] = createExportWrapper("emscripten_bind_b2JointDef_get_bodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointDef_set_bodyB_1 = Module["_emscripten_bind_b2JointDef_set_bodyB_1"] = createExportWrapper("emscripten_bind_b2JointDef_set_bodyB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointDef_get_collideConnected_0 = Module["_emscripten_bind_b2JointDef_get_collideConnected_0"] = createExportWrapper("emscripten_bind_b2JointDef_get_collideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointDef_set_collideConnected_1 = Module["_emscripten_bind_b2JointDef_set_collideConnected_1"] = createExportWrapper("emscripten_bind_b2JointDef_set_collideConnected_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointDef___destroy___0 = Module["_emscripten_bind_b2JointDef___destroy___0"] = createExportWrapper("emscripten_bind_b2JointDef___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Joint_GetType_0 = Module["_emscripten_bind_b2Joint_GetType_0"] = createExportWrapper("emscripten_bind_b2Joint_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Joint_GetBodyA_0 = Module["_emscripten_bind_b2Joint_GetBodyA_0"] = createExportWrapper("emscripten_bind_b2Joint_GetBodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Joint_GetBodyB_0 = Module["_emscripten_bind_b2Joint_GetBodyB_0"] = createExportWrapper("emscripten_bind_b2Joint_GetBodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Joint_GetAnchorA_0 = Module["_emscripten_bind_b2Joint_GetAnchorA_0"] = createExportWrapper("emscripten_bind_b2Joint_GetAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Joint_GetAnchorB_0 = Module["_emscripten_bind_b2Joint_GetAnchorB_0"] = createExportWrapper("emscripten_bind_b2Joint_GetAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Joint_GetReactionForce_1 = Module["_emscripten_bind_b2Joint_GetReactionForce_1"] = createExportWrapper("emscripten_bind_b2Joint_GetReactionForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Joint_GetReactionTorque_1 = Module["_emscripten_bind_b2Joint_GetReactionTorque_1"] = createExportWrapper("emscripten_bind_b2Joint_GetReactionTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Joint_GetNext_0 = Module["_emscripten_bind_b2Joint_GetNext_0"] = createExportWrapper("emscripten_bind_b2Joint_GetNext_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Joint_GetUserData_0 = Module["_emscripten_bind_b2Joint_GetUserData_0"] = createExportWrapper("emscripten_bind_b2Joint_GetUserData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Joint_GetCollideConnected_0 = Module["_emscripten_bind_b2Joint_GetCollideConnected_0"] = createExportWrapper("emscripten_bind_b2Joint_GetCollideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Joint_Dump_0 = Module["_emscripten_bind_b2Joint_Dump_0"] = createExportWrapper("emscripten_bind_b2Joint_Dump_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactFilter___destroy___0 = Module["_emscripten_bind_b2ContactFilter___destroy___0"] = createExportWrapper("emscripten_bind_b2ContactFilter___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DestructionListenerWrapper___destroy___0 = Module["_emscripten_bind_b2DestructionListenerWrapper___destroy___0"] = createExportWrapper("emscripten_bind_b2DestructionListenerWrapper___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Draw_SetFlags_1 = Module["_emscripten_bind_b2Draw_SetFlags_1"] = createExportWrapper("emscripten_bind_b2Draw_SetFlags_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Draw_GetFlags_0 = Module["_emscripten_bind_b2Draw_GetFlags_0"] = createExportWrapper("emscripten_bind_b2Draw_GetFlags_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Draw_AppendFlags_1 = Module["_emscripten_bind_b2Draw_AppendFlags_1"] = createExportWrapper("emscripten_bind_b2Draw_AppendFlags_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Draw_ClearFlags_1 = Module["_emscripten_bind_b2Draw_ClearFlags_1"] = createExportWrapper("emscripten_bind_b2Draw_ClearFlags_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Draw___destroy___0 = Module["_emscripten_bind_b2Draw___destroy___0"] = createExportWrapper("emscripten_bind_b2Draw___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_VoidPtr___destroy___0 = Module["_emscripten_bind_VoidPtr___destroy___0"] = createExportWrapper("emscripten_bind_VoidPtr___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_GetManifold_0 = Module["_emscripten_bind_b2Contact_GetManifold_0"] = createExportWrapper("emscripten_bind_b2Contact_GetManifold_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_GetWorldManifold_1 = Module["_emscripten_bind_b2Contact_GetWorldManifold_1"] = createExportWrapper("emscripten_bind_b2Contact_GetWorldManifold_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_IsTouching_0 = Module["_emscripten_bind_b2Contact_IsTouching_0"] = createExportWrapper("emscripten_bind_b2Contact_IsTouching_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_SetEnabled_1 = Module["_emscripten_bind_b2Contact_SetEnabled_1"] = createExportWrapper("emscripten_bind_b2Contact_SetEnabled_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_IsEnabled_0 = Module["_emscripten_bind_b2Contact_IsEnabled_0"] = createExportWrapper("emscripten_bind_b2Contact_IsEnabled_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_GetNext_0 = Module["_emscripten_bind_b2Contact_GetNext_0"] = createExportWrapper("emscripten_bind_b2Contact_GetNext_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_GetFixtureA_0 = Module["_emscripten_bind_b2Contact_GetFixtureA_0"] = createExportWrapper("emscripten_bind_b2Contact_GetFixtureA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_GetChildIndexA_0 = Module["_emscripten_bind_b2Contact_GetChildIndexA_0"] = createExportWrapper("emscripten_bind_b2Contact_GetChildIndexA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_GetFixtureB_0 = Module["_emscripten_bind_b2Contact_GetFixtureB_0"] = createExportWrapper("emscripten_bind_b2Contact_GetFixtureB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_GetChildIndexB_0 = Module["_emscripten_bind_b2Contact_GetChildIndexB_0"] = createExportWrapper("emscripten_bind_b2Contact_GetChildIndexB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_SetFriction_1 = Module["_emscripten_bind_b2Contact_SetFriction_1"] = createExportWrapper("emscripten_bind_b2Contact_SetFriction_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_GetFriction_0 = Module["_emscripten_bind_b2Contact_GetFriction_0"] = createExportWrapper("emscripten_bind_b2Contact_GetFriction_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_ResetFriction_0 = Module["_emscripten_bind_b2Contact_ResetFriction_0"] = createExportWrapper("emscripten_bind_b2Contact_ResetFriction_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_SetRestitution_1 = Module["_emscripten_bind_b2Contact_SetRestitution_1"] = createExportWrapper("emscripten_bind_b2Contact_SetRestitution_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_GetRestitution_0 = Module["_emscripten_bind_b2Contact_GetRestitution_0"] = createExportWrapper("emscripten_bind_b2Contact_GetRestitution_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_ResetRestitution_0 = Module["_emscripten_bind_b2Contact_ResetRestitution_0"] = createExportWrapper("emscripten_bind_b2Contact_ResetRestitution_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_SetRestitutionThreshold_1 = Module["_emscripten_bind_b2Contact_SetRestitutionThreshold_1"] = createExportWrapper("emscripten_bind_b2Contact_SetRestitutionThreshold_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_GetRestitutionThreshold_0 = Module["_emscripten_bind_b2Contact_GetRestitutionThreshold_0"] = createExportWrapper("emscripten_bind_b2Contact_GetRestitutionThreshold_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_ResetRestitutionThreshold_0 = Module["_emscripten_bind_b2Contact_ResetRestitutionThreshold_0"] = createExportWrapper("emscripten_bind_b2Contact_ResetRestitutionThreshold_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_SetTangentSpeed_1 = Module["_emscripten_bind_b2Contact_SetTangentSpeed_1"] = createExportWrapper("emscripten_bind_b2Contact_SetTangentSpeed_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Contact_GetTangentSpeed_0 = Module["_emscripten_bind_b2Contact_GetTangentSpeed_0"] = createExportWrapper("emscripten_bind_b2Contact_GetTangentSpeed_0");

/** @type {function(...*):?} */
var _emscripten_bind_JSContactListener_JSContactListener_0 = Module["_emscripten_bind_JSContactListener_JSContactListener_0"] = createExportWrapper("emscripten_bind_JSContactListener_JSContactListener_0");

/** @type {function(...*):?} */
var _emscripten_bind_JSContactListener_BeginContact_1 = Module["_emscripten_bind_JSContactListener_BeginContact_1"] = createExportWrapper("emscripten_bind_JSContactListener_BeginContact_1");

/** @type {function(...*):?} */
var _emscripten_bind_JSContactListener_EndContact_1 = Module["_emscripten_bind_JSContactListener_EndContact_1"] = createExportWrapper("emscripten_bind_JSContactListener_EndContact_1");

/** @type {function(...*):?} */
var _emscripten_bind_JSContactListener_PreSolve_2 = Module["_emscripten_bind_JSContactListener_PreSolve_2"] = createExportWrapper("emscripten_bind_JSContactListener_PreSolve_2");

/** @type {function(...*):?} */
var _emscripten_bind_JSContactListener_PostSolve_2 = Module["_emscripten_bind_JSContactListener_PostSolve_2"] = createExportWrapper("emscripten_bind_JSContactListener_PostSolve_2");

/** @type {function(...*):?} */
var _emscripten_bind_JSContactListener___destroy___0 = Module["_emscripten_bind_JSContactListener___destroy___0"] = createExportWrapper("emscripten_bind_JSContactListener___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_b2World_1 = Module["_emscripten_bind_b2World_b2World_1"] = createExportWrapper("emscripten_bind_b2World_b2World_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_SetDestructionListener_1 = Module["_emscripten_bind_b2World_SetDestructionListener_1"] = createExportWrapper("emscripten_bind_b2World_SetDestructionListener_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_SetContactFilter_1 = Module["_emscripten_bind_b2World_SetContactFilter_1"] = createExportWrapper("emscripten_bind_b2World_SetContactFilter_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_SetContactListener_1 = Module["_emscripten_bind_b2World_SetContactListener_1"] = createExportWrapper("emscripten_bind_b2World_SetContactListener_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_SetDebugDraw_1 = Module["_emscripten_bind_b2World_SetDebugDraw_1"] = createExportWrapper("emscripten_bind_b2World_SetDebugDraw_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_CreateBody_1 = Module["_emscripten_bind_b2World_CreateBody_1"] = createExportWrapper("emscripten_bind_b2World_CreateBody_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_DestroyBody_1 = Module["_emscripten_bind_b2World_DestroyBody_1"] = createExportWrapper("emscripten_bind_b2World_DestroyBody_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_CreateJoint_1 = Module["_emscripten_bind_b2World_CreateJoint_1"] = createExportWrapper("emscripten_bind_b2World_CreateJoint_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_DestroyJoint_1 = Module["_emscripten_bind_b2World_DestroyJoint_1"] = createExportWrapper("emscripten_bind_b2World_DestroyJoint_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_Step_3 = Module["_emscripten_bind_b2World_Step_3"] = createExportWrapper("emscripten_bind_b2World_Step_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_ClearForces_0 = Module["_emscripten_bind_b2World_ClearForces_0"] = createExportWrapper("emscripten_bind_b2World_ClearForces_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_DebugDraw_0 = Module["_emscripten_bind_b2World_DebugDraw_0"] = createExportWrapper("emscripten_bind_b2World_DebugDraw_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_QueryAABB_2 = Module["_emscripten_bind_b2World_QueryAABB_2"] = createExportWrapper("emscripten_bind_b2World_QueryAABB_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_RayCast_3 = Module["_emscripten_bind_b2World_RayCast_3"] = createExportWrapper("emscripten_bind_b2World_RayCast_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetBodyList_0 = Module["_emscripten_bind_b2World_GetBodyList_0"] = createExportWrapper("emscripten_bind_b2World_GetBodyList_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetJointList_0 = Module["_emscripten_bind_b2World_GetJointList_0"] = createExportWrapper("emscripten_bind_b2World_GetJointList_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetContactList_0 = Module["_emscripten_bind_b2World_GetContactList_0"] = createExportWrapper("emscripten_bind_b2World_GetContactList_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_SetAllowSleeping_1 = Module["_emscripten_bind_b2World_SetAllowSleeping_1"] = createExportWrapper("emscripten_bind_b2World_SetAllowSleeping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetAllowSleeping_0 = Module["_emscripten_bind_b2World_GetAllowSleeping_0"] = createExportWrapper("emscripten_bind_b2World_GetAllowSleeping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_SetWarmStarting_1 = Module["_emscripten_bind_b2World_SetWarmStarting_1"] = createExportWrapper("emscripten_bind_b2World_SetWarmStarting_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetWarmStarting_0 = Module["_emscripten_bind_b2World_GetWarmStarting_0"] = createExportWrapper("emscripten_bind_b2World_GetWarmStarting_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_SetContinuousPhysics_1 = Module["_emscripten_bind_b2World_SetContinuousPhysics_1"] = createExportWrapper("emscripten_bind_b2World_SetContinuousPhysics_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetContinuousPhysics_0 = Module["_emscripten_bind_b2World_GetContinuousPhysics_0"] = createExportWrapper("emscripten_bind_b2World_GetContinuousPhysics_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_SetSubStepping_1 = Module["_emscripten_bind_b2World_SetSubStepping_1"] = createExportWrapper("emscripten_bind_b2World_SetSubStepping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetSubStepping_0 = Module["_emscripten_bind_b2World_GetSubStepping_0"] = createExportWrapper("emscripten_bind_b2World_GetSubStepping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetProxyCount_0 = Module["_emscripten_bind_b2World_GetProxyCount_0"] = createExportWrapper("emscripten_bind_b2World_GetProxyCount_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetBodyCount_0 = Module["_emscripten_bind_b2World_GetBodyCount_0"] = createExportWrapper("emscripten_bind_b2World_GetBodyCount_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetJointCount_0 = Module["_emscripten_bind_b2World_GetJointCount_0"] = createExportWrapper("emscripten_bind_b2World_GetJointCount_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetContactCount_0 = Module["_emscripten_bind_b2World_GetContactCount_0"] = createExportWrapper("emscripten_bind_b2World_GetContactCount_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetTreeHeight_0 = Module["_emscripten_bind_b2World_GetTreeHeight_0"] = createExportWrapper("emscripten_bind_b2World_GetTreeHeight_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetTreeBalance_0 = Module["_emscripten_bind_b2World_GetTreeBalance_0"] = createExportWrapper("emscripten_bind_b2World_GetTreeBalance_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetTreeQuality_0 = Module["_emscripten_bind_b2World_GetTreeQuality_0"] = createExportWrapper("emscripten_bind_b2World_GetTreeQuality_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_SetGravity_1 = Module["_emscripten_bind_b2World_SetGravity_1"] = createExportWrapper("emscripten_bind_b2World_SetGravity_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetGravity_0 = Module["_emscripten_bind_b2World_GetGravity_0"] = createExportWrapper("emscripten_bind_b2World_GetGravity_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_IsLocked_0 = Module["_emscripten_bind_b2World_IsLocked_0"] = createExportWrapper("emscripten_bind_b2World_IsLocked_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_SetAutoClearForces_1 = Module["_emscripten_bind_b2World_SetAutoClearForces_1"] = createExportWrapper("emscripten_bind_b2World_SetAutoClearForces_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetAutoClearForces_0 = Module["_emscripten_bind_b2World_GetAutoClearForces_0"] = createExportWrapper("emscripten_bind_b2World_GetAutoClearForces_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_GetProfile_0 = Module["_emscripten_bind_b2World_GetProfile_0"] = createExportWrapper("emscripten_bind_b2World_GetProfile_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World_Dump_0 = Module["_emscripten_bind_b2World_Dump_0"] = createExportWrapper("emscripten_bind_b2World_Dump_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2World___destroy___0 = Module["_emscripten_bind_b2World___destroy___0"] = createExportWrapper("emscripten_bind_b2World___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureUserData_get_pointer_0 = Module["_emscripten_bind_b2FixtureUserData_get_pointer_0"] = createExportWrapper("emscripten_bind_b2FixtureUserData_get_pointer_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureUserData_set_pointer_1 = Module["_emscripten_bind_b2FixtureUserData_set_pointer_1"] = createExportWrapper("emscripten_bind_b2FixtureUserData_set_pointer_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureUserData___destroy___0 = Module["_emscripten_bind_b2FixtureUserData___destroy___0"] = createExportWrapper("emscripten_bind_b2FixtureUserData___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_b2FixtureDef_0 = Module["_emscripten_bind_b2FixtureDef_b2FixtureDef_0"] = createExportWrapper("emscripten_bind_b2FixtureDef_b2FixtureDef_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_get_shape_0 = Module["_emscripten_bind_b2FixtureDef_get_shape_0"] = createExportWrapper("emscripten_bind_b2FixtureDef_get_shape_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_set_shape_1 = Module["_emscripten_bind_b2FixtureDef_set_shape_1"] = createExportWrapper("emscripten_bind_b2FixtureDef_set_shape_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_get_userData_0 = Module["_emscripten_bind_b2FixtureDef_get_userData_0"] = createExportWrapper("emscripten_bind_b2FixtureDef_get_userData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_set_userData_1 = Module["_emscripten_bind_b2FixtureDef_set_userData_1"] = createExportWrapper("emscripten_bind_b2FixtureDef_set_userData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_get_friction_0 = Module["_emscripten_bind_b2FixtureDef_get_friction_0"] = createExportWrapper("emscripten_bind_b2FixtureDef_get_friction_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_set_friction_1 = Module["_emscripten_bind_b2FixtureDef_set_friction_1"] = createExportWrapper("emscripten_bind_b2FixtureDef_set_friction_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_get_restitution_0 = Module["_emscripten_bind_b2FixtureDef_get_restitution_0"] = createExportWrapper("emscripten_bind_b2FixtureDef_get_restitution_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_set_restitution_1 = Module["_emscripten_bind_b2FixtureDef_set_restitution_1"] = createExportWrapper("emscripten_bind_b2FixtureDef_set_restitution_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_get_restitutionThreshold_0 = Module["_emscripten_bind_b2FixtureDef_get_restitutionThreshold_0"] = createExportWrapper("emscripten_bind_b2FixtureDef_get_restitutionThreshold_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_set_restitutionThreshold_1 = Module["_emscripten_bind_b2FixtureDef_set_restitutionThreshold_1"] = createExportWrapper("emscripten_bind_b2FixtureDef_set_restitutionThreshold_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_get_density_0 = Module["_emscripten_bind_b2FixtureDef_get_density_0"] = createExportWrapper("emscripten_bind_b2FixtureDef_get_density_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_set_density_1 = Module["_emscripten_bind_b2FixtureDef_set_density_1"] = createExportWrapper("emscripten_bind_b2FixtureDef_set_density_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_get_isSensor_0 = Module["_emscripten_bind_b2FixtureDef_get_isSensor_0"] = createExportWrapper("emscripten_bind_b2FixtureDef_get_isSensor_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_set_isSensor_1 = Module["_emscripten_bind_b2FixtureDef_set_isSensor_1"] = createExportWrapper("emscripten_bind_b2FixtureDef_set_isSensor_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_get_filter_0 = Module["_emscripten_bind_b2FixtureDef_get_filter_0"] = createExportWrapper("emscripten_bind_b2FixtureDef_get_filter_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef_set_filter_1 = Module["_emscripten_bind_b2FixtureDef_set_filter_1"] = createExportWrapper("emscripten_bind_b2FixtureDef_set_filter_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FixtureDef___destroy___0 = Module["_emscripten_bind_b2FixtureDef___destroy___0"] = createExportWrapper("emscripten_bind_b2FixtureDef___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_GetType_0 = Module["_emscripten_bind_b2Fixture_GetType_0"] = createExportWrapper("emscripten_bind_b2Fixture_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_GetShape_0 = Module["_emscripten_bind_b2Fixture_GetShape_0"] = createExportWrapper("emscripten_bind_b2Fixture_GetShape_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_SetSensor_1 = Module["_emscripten_bind_b2Fixture_SetSensor_1"] = createExportWrapper("emscripten_bind_b2Fixture_SetSensor_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_IsSensor_0 = Module["_emscripten_bind_b2Fixture_IsSensor_0"] = createExportWrapper("emscripten_bind_b2Fixture_IsSensor_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_SetFilterData_1 = Module["_emscripten_bind_b2Fixture_SetFilterData_1"] = createExportWrapper("emscripten_bind_b2Fixture_SetFilterData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_GetFilterData_0 = Module["_emscripten_bind_b2Fixture_GetFilterData_0"] = createExportWrapper("emscripten_bind_b2Fixture_GetFilterData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_Refilter_0 = Module["_emscripten_bind_b2Fixture_Refilter_0"] = createExportWrapper("emscripten_bind_b2Fixture_Refilter_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_GetBody_0 = Module["_emscripten_bind_b2Fixture_GetBody_0"] = createExportWrapper("emscripten_bind_b2Fixture_GetBody_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_GetNext_0 = Module["_emscripten_bind_b2Fixture_GetNext_0"] = createExportWrapper("emscripten_bind_b2Fixture_GetNext_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_GetUserData_0 = Module["_emscripten_bind_b2Fixture_GetUserData_0"] = createExportWrapper("emscripten_bind_b2Fixture_GetUserData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_TestPoint_1 = Module["_emscripten_bind_b2Fixture_TestPoint_1"] = createExportWrapper("emscripten_bind_b2Fixture_TestPoint_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_RayCast_3 = Module["_emscripten_bind_b2Fixture_RayCast_3"] = createExportWrapper("emscripten_bind_b2Fixture_RayCast_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_GetMassData_1 = Module["_emscripten_bind_b2Fixture_GetMassData_1"] = createExportWrapper("emscripten_bind_b2Fixture_GetMassData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_SetDensity_1 = Module["_emscripten_bind_b2Fixture_SetDensity_1"] = createExportWrapper("emscripten_bind_b2Fixture_SetDensity_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_GetDensity_0 = Module["_emscripten_bind_b2Fixture_GetDensity_0"] = createExportWrapper("emscripten_bind_b2Fixture_GetDensity_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_GetFriction_0 = Module["_emscripten_bind_b2Fixture_GetFriction_0"] = createExportWrapper("emscripten_bind_b2Fixture_GetFriction_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_SetFriction_1 = Module["_emscripten_bind_b2Fixture_SetFriction_1"] = createExportWrapper("emscripten_bind_b2Fixture_SetFriction_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_GetRestitution_0 = Module["_emscripten_bind_b2Fixture_GetRestitution_0"] = createExportWrapper("emscripten_bind_b2Fixture_GetRestitution_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_SetRestitution_1 = Module["_emscripten_bind_b2Fixture_SetRestitution_1"] = createExportWrapper("emscripten_bind_b2Fixture_SetRestitution_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_GetRestitutionThreshold_0 = Module["_emscripten_bind_b2Fixture_GetRestitutionThreshold_0"] = createExportWrapper("emscripten_bind_b2Fixture_GetRestitutionThreshold_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_SetRestitutionThreshold_1 = Module["_emscripten_bind_b2Fixture_SetRestitutionThreshold_1"] = createExportWrapper("emscripten_bind_b2Fixture_SetRestitutionThreshold_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_GetAABB_1 = Module["_emscripten_bind_b2Fixture_GetAABB_1"] = createExportWrapper("emscripten_bind_b2Fixture_GetAABB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture_Dump_1 = Module["_emscripten_bind_b2Fixture_Dump_1"] = createExportWrapper("emscripten_bind_b2Fixture_Dump_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Fixture___destroy___0 = Module["_emscripten_bind_b2Fixture___destroy___0"] = createExportWrapper("emscripten_bind_b2Fixture___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Transform_b2Transform_0 = Module["_emscripten_bind_b2Transform_b2Transform_0"] = createExportWrapper("emscripten_bind_b2Transform_b2Transform_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Transform_b2Transform_2 = Module["_emscripten_bind_b2Transform_b2Transform_2"] = createExportWrapper("emscripten_bind_b2Transform_b2Transform_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2Transform_SetIdentity_0 = Module["_emscripten_bind_b2Transform_SetIdentity_0"] = createExportWrapper("emscripten_bind_b2Transform_SetIdentity_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Transform_Set_2 = Module["_emscripten_bind_b2Transform_Set_2"] = createExportWrapper("emscripten_bind_b2Transform_Set_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2Transform_get_p_0 = Module["_emscripten_bind_b2Transform_get_p_0"] = createExportWrapper("emscripten_bind_b2Transform_get_p_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Transform_set_p_1 = Module["_emscripten_bind_b2Transform_set_p_1"] = createExportWrapper("emscripten_bind_b2Transform_set_p_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Transform_get_q_0 = Module["_emscripten_bind_b2Transform_get_q_0"] = createExportWrapper("emscripten_bind_b2Transform_get_q_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Transform_set_q_1 = Module["_emscripten_bind_b2Transform_set_q_1"] = createExportWrapper("emscripten_bind_b2Transform_set_q_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Transform___destroy___0 = Module["_emscripten_bind_b2Transform___destroy___0"] = createExportWrapper("emscripten_bind_b2Transform___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_JSRayCastCallback_JSRayCastCallback_0 = Module["_emscripten_bind_JSRayCastCallback_JSRayCastCallback_0"] = createExportWrapper("emscripten_bind_JSRayCastCallback_JSRayCastCallback_0");

/** @type {function(...*):?} */
var _emscripten_bind_JSRayCastCallback_ReportFixture_4 = Module["_emscripten_bind_JSRayCastCallback_ReportFixture_4"] = createExportWrapper("emscripten_bind_JSRayCastCallback_ReportFixture_4");

/** @type {function(...*):?} */
var _emscripten_bind_JSRayCastCallback___destroy___0 = Module["_emscripten_bind_JSRayCastCallback___destroy___0"] = createExportWrapper("emscripten_bind_JSRayCastCallback___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_JSQueryCallback_JSQueryCallback_0 = Module["_emscripten_bind_JSQueryCallback_JSQueryCallback_0"] = createExportWrapper("emscripten_bind_JSQueryCallback_JSQueryCallback_0");

/** @type {function(...*):?} */
var _emscripten_bind_JSQueryCallback_ReportFixture_1 = Module["_emscripten_bind_JSQueryCallback_ReportFixture_1"] = createExportWrapper("emscripten_bind_JSQueryCallback_ReportFixture_1");

/** @type {function(...*):?} */
var _emscripten_bind_JSQueryCallback___destroy___0 = Module["_emscripten_bind_JSQueryCallback___destroy___0"] = createExportWrapper("emscripten_bind_JSQueryCallback___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MassData_b2MassData_0 = Module["_emscripten_bind_b2MassData_b2MassData_0"] = createExportWrapper("emscripten_bind_b2MassData_b2MassData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MassData_get_mass_0 = Module["_emscripten_bind_b2MassData_get_mass_0"] = createExportWrapper("emscripten_bind_b2MassData_get_mass_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MassData_set_mass_1 = Module["_emscripten_bind_b2MassData_set_mass_1"] = createExportWrapper("emscripten_bind_b2MassData_set_mass_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MassData_get_center_0 = Module["_emscripten_bind_b2MassData_get_center_0"] = createExportWrapper("emscripten_bind_b2MassData_get_center_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MassData_set_center_1 = Module["_emscripten_bind_b2MassData_set_center_1"] = createExportWrapper("emscripten_bind_b2MassData_set_center_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MassData_get_I_0 = Module["_emscripten_bind_b2MassData_get_I_0"] = createExportWrapper("emscripten_bind_b2MassData_get_I_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MassData_set_I_1 = Module["_emscripten_bind_b2MassData_set_I_1"] = createExportWrapper("emscripten_bind_b2MassData_set_I_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MassData___destroy___0 = Module["_emscripten_bind_b2MassData___destroy___0"] = createExportWrapper("emscripten_bind_b2MassData___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2_b2Vec2_0 = Module["_emscripten_bind_b2Vec2_b2Vec2_0"] = createExportWrapper("emscripten_bind_b2Vec2_b2Vec2_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2_b2Vec2_2 = Module["_emscripten_bind_b2Vec2_b2Vec2_2"] = createExportWrapper("emscripten_bind_b2Vec2_b2Vec2_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2_SetZero_0 = Module["_emscripten_bind_b2Vec2_SetZero_0"] = createExportWrapper("emscripten_bind_b2Vec2_SetZero_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2_Set_2 = Module["_emscripten_bind_b2Vec2_Set_2"] = createExportWrapper("emscripten_bind_b2Vec2_Set_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2_op_add_1 = Module["_emscripten_bind_b2Vec2_op_add_1"] = createExportWrapper("emscripten_bind_b2Vec2_op_add_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2_op_sub_1 = Module["_emscripten_bind_b2Vec2_op_sub_1"] = createExportWrapper("emscripten_bind_b2Vec2_op_sub_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2_op_mul_1 = Module["_emscripten_bind_b2Vec2_op_mul_1"] = createExportWrapper("emscripten_bind_b2Vec2_op_mul_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2_Length_0 = Module["_emscripten_bind_b2Vec2_Length_0"] = createExportWrapper("emscripten_bind_b2Vec2_Length_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2_LengthSquared_0 = Module["_emscripten_bind_b2Vec2_LengthSquared_0"] = createExportWrapper("emscripten_bind_b2Vec2_LengthSquared_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2_Normalize_0 = Module["_emscripten_bind_b2Vec2_Normalize_0"] = createExportWrapper("emscripten_bind_b2Vec2_Normalize_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2_IsValid_0 = Module["_emscripten_bind_b2Vec2_IsValid_0"] = createExportWrapper("emscripten_bind_b2Vec2_IsValid_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2_Skew_0 = Module["_emscripten_bind_b2Vec2_Skew_0"] = createExportWrapper("emscripten_bind_b2Vec2_Skew_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2_get_x_0 = Module["_emscripten_bind_b2Vec2_get_x_0"] = createExportWrapper("emscripten_bind_b2Vec2_get_x_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2_set_x_1 = Module["_emscripten_bind_b2Vec2_set_x_1"] = createExportWrapper("emscripten_bind_b2Vec2_set_x_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2_get_y_0 = Module["_emscripten_bind_b2Vec2_get_y_0"] = createExportWrapper("emscripten_bind_b2Vec2_get_y_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2_set_y_1 = Module["_emscripten_bind_b2Vec2_set_y_1"] = createExportWrapper("emscripten_bind_b2Vec2_set_y_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec2___destroy___0 = Module["_emscripten_bind_b2Vec2___destroy___0"] = createExportWrapper("emscripten_bind_b2Vec2___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec3_b2Vec3_0 = Module["_emscripten_bind_b2Vec3_b2Vec3_0"] = createExportWrapper("emscripten_bind_b2Vec3_b2Vec3_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec3_b2Vec3_3 = Module["_emscripten_bind_b2Vec3_b2Vec3_3"] = createExportWrapper("emscripten_bind_b2Vec3_b2Vec3_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec3_SetZero_0 = Module["_emscripten_bind_b2Vec3_SetZero_0"] = createExportWrapper("emscripten_bind_b2Vec3_SetZero_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec3_Set_3 = Module["_emscripten_bind_b2Vec3_Set_3"] = createExportWrapper("emscripten_bind_b2Vec3_Set_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec3_op_add_1 = Module["_emscripten_bind_b2Vec3_op_add_1"] = createExportWrapper("emscripten_bind_b2Vec3_op_add_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec3_op_sub_1 = Module["_emscripten_bind_b2Vec3_op_sub_1"] = createExportWrapper("emscripten_bind_b2Vec3_op_sub_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec3_op_mul_1 = Module["_emscripten_bind_b2Vec3_op_mul_1"] = createExportWrapper("emscripten_bind_b2Vec3_op_mul_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec3_get_x_0 = Module["_emscripten_bind_b2Vec3_get_x_0"] = createExportWrapper("emscripten_bind_b2Vec3_get_x_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec3_set_x_1 = Module["_emscripten_bind_b2Vec3_set_x_1"] = createExportWrapper("emscripten_bind_b2Vec3_set_x_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec3_get_y_0 = Module["_emscripten_bind_b2Vec3_get_y_0"] = createExportWrapper("emscripten_bind_b2Vec3_get_y_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec3_set_y_1 = Module["_emscripten_bind_b2Vec3_set_y_1"] = createExportWrapper("emscripten_bind_b2Vec3_set_y_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec3_get_z_0 = Module["_emscripten_bind_b2Vec3_get_z_0"] = createExportWrapper("emscripten_bind_b2Vec3_get_z_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec3_set_z_1 = Module["_emscripten_bind_b2Vec3_set_z_1"] = createExportWrapper("emscripten_bind_b2Vec3_set_z_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Vec3___destroy___0 = Module["_emscripten_bind_b2Vec3___destroy___0"] = createExportWrapper("emscripten_bind_b2Vec3___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyUserData_get_pointer_0 = Module["_emscripten_bind_b2BodyUserData_get_pointer_0"] = createExportWrapper("emscripten_bind_b2BodyUserData_get_pointer_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyUserData_set_pointer_1 = Module["_emscripten_bind_b2BodyUserData_set_pointer_1"] = createExportWrapper("emscripten_bind_b2BodyUserData_set_pointer_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyUserData___destroy___0 = Module["_emscripten_bind_b2BodyUserData___destroy___0"] = createExportWrapper("emscripten_bind_b2BodyUserData___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_CreateFixture_1 = Module["_emscripten_bind_b2Body_CreateFixture_1"] = createExportWrapper("emscripten_bind_b2Body_CreateFixture_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_CreateFixture_2 = Module["_emscripten_bind_b2Body_CreateFixture_2"] = createExportWrapper("emscripten_bind_b2Body_CreateFixture_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_DestroyFixture_1 = Module["_emscripten_bind_b2Body_DestroyFixture_1"] = createExportWrapper("emscripten_bind_b2Body_DestroyFixture_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_SetTransform_2 = Module["_emscripten_bind_b2Body_SetTransform_2"] = createExportWrapper("emscripten_bind_b2Body_SetTransform_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetTransform_0 = Module["_emscripten_bind_b2Body_GetTransform_0"] = createExportWrapper("emscripten_bind_b2Body_GetTransform_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetPosition_0 = Module["_emscripten_bind_b2Body_GetPosition_0"] = createExportWrapper("emscripten_bind_b2Body_GetPosition_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetAngle_0 = Module["_emscripten_bind_b2Body_GetAngle_0"] = createExportWrapper("emscripten_bind_b2Body_GetAngle_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetWorldCenter_0 = Module["_emscripten_bind_b2Body_GetWorldCenter_0"] = createExportWrapper("emscripten_bind_b2Body_GetWorldCenter_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetLocalCenter_0 = Module["_emscripten_bind_b2Body_GetLocalCenter_0"] = createExportWrapper("emscripten_bind_b2Body_GetLocalCenter_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_SetLinearVelocity_1 = Module["_emscripten_bind_b2Body_SetLinearVelocity_1"] = createExportWrapper("emscripten_bind_b2Body_SetLinearVelocity_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetLinearVelocity_0 = Module["_emscripten_bind_b2Body_GetLinearVelocity_0"] = createExportWrapper("emscripten_bind_b2Body_GetLinearVelocity_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_SetAngularVelocity_1 = Module["_emscripten_bind_b2Body_SetAngularVelocity_1"] = createExportWrapper("emscripten_bind_b2Body_SetAngularVelocity_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetAngularVelocity_0 = Module["_emscripten_bind_b2Body_GetAngularVelocity_0"] = createExportWrapper("emscripten_bind_b2Body_GetAngularVelocity_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_ApplyForce_3 = Module["_emscripten_bind_b2Body_ApplyForce_3"] = createExportWrapper("emscripten_bind_b2Body_ApplyForce_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_ApplyForceToCenter_2 = Module["_emscripten_bind_b2Body_ApplyForceToCenter_2"] = createExportWrapper("emscripten_bind_b2Body_ApplyForceToCenter_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_ApplyTorque_2 = Module["_emscripten_bind_b2Body_ApplyTorque_2"] = createExportWrapper("emscripten_bind_b2Body_ApplyTorque_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_ApplyLinearImpulse_3 = Module["_emscripten_bind_b2Body_ApplyLinearImpulse_3"] = createExportWrapper("emscripten_bind_b2Body_ApplyLinearImpulse_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_ApplyLinearImpulseToCenter_2 = Module["_emscripten_bind_b2Body_ApplyLinearImpulseToCenter_2"] = createExportWrapper("emscripten_bind_b2Body_ApplyLinearImpulseToCenter_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_ApplyAngularImpulse_2 = Module["_emscripten_bind_b2Body_ApplyAngularImpulse_2"] = createExportWrapper("emscripten_bind_b2Body_ApplyAngularImpulse_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetMass_0 = Module["_emscripten_bind_b2Body_GetMass_0"] = createExportWrapper("emscripten_bind_b2Body_GetMass_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetInertia_0 = Module["_emscripten_bind_b2Body_GetInertia_0"] = createExportWrapper("emscripten_bind_b2Body_GetInertia_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetMassData_1 = Module["_emscripten_bind_b2Body_GetMassData_1"] = createExportWrapper("emscripten_bind_b2Body_GetMassData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_SetMassData_1 = Module["_emscripten_bind_b2Body_SetMassData_1"] = createExportWrapper("emscripten_bind_b2Body_SetMassData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_ResetMassData_0 = Module["_emscripten_bind_b2Body_ResetMassData_0"] = createExportWrapper("emscripten_bind_b2Body_ResetMassData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetWorldPoint_1 = Module["_emscripten_bind_b2Body_GetWorldPoint_1"] = createExportWrapper("emscripten_bind_b2Body_GetWorldPoint_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetWorldVector_1 = Module["_emscripten_bind_b2Body_GetWorldVector_1"] = createExportWrapper("emscripten_bind_b2Body_GetWorldVector_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetLocalPoint_1 = Module["_emscripten_bind_b2Body_GetLocalPoint_1"] = createExportWrapper("emscripten_bind_b2Body_GetLocalPoint_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetLocalVector_1 = Module["_emscripten_bind_b2Body_GetLocalVector_1"] = createExportWrapper("emscripten_bind_b2Body_GetLocalVector_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetLinearVelocityFromWorldPoint_1 = Module["_emscripten_bind_b2Body_GetLinearVelocityFromWorldPoint_1"] = createExportWrapper("emscripten_bind_b2Body_GetLinearVelocityFromWorldPoint_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetLinearVelocityFromLocalPoint_1 = Module["_emscripten_bind_b2Body_GetLinearVelocityFromLocalPoint_1"] = createExportWrapper("emscripten_bind_b2Body_GetLinearVelocityFromLocalPoint_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetLinearDamping_0 = Module["_emscripten_bind_b2Body_GetLinearDamping_0"] = createExportWrapper("emscripten_bind_b2Body_GetLinearDamping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_SetLinearDamping_1 = Module["_emscripten_bind_b2Body_SetLinearDamping_1"] = createExportWrapper("emscripten_bind_b2Body_SetLinearDamping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetAngularDamping_0 = Module["_emscripten_bind_b2Body_GetAngularDamping_0"] = createExportWrapper("emscripten_bind_b2Body_GetAngularDamping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_SetAngularDamping_1 = Module["_emscripten_bind_b2Body_SetAngularDamping_1"] = createExportWrapper("emscripten_bind_b2Body_SetAngularDamping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetGravityScale_0 = Module["_emscripten_bind_b2Body_GetGravityScale_0"] = createExportWrapper("emscripten_bind_b2Body_GetGravityScale_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_SetGravityScale_1 = Module["_emscripten_bind_b2Body_SetGravityScale_1"] = createExportWrapper("emscripten_bind_b2Body_SetGravityScale_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_SetType_1 = Module["_emscripten_bind_b2Body_SetType_1"] = createExportWrapper("emscripten_bind_b2Body_SetType_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetType_0 = Module["_emscripten_bind_b2Body_GetType_0"] = createExportWrapper("emscripten_bind_b2Body_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_SetBullet_1 = Module["_emscripten_bind_b2Body_SetBullet_1"] = createExportWrapper("emscripten_bind_b2Body_SetBullet_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_IsBullet_0 = Module["_emscripten_bind_b2Body_IsBullet_0"] = createExportWrapper("emscripten_bind_b2Body_IsBullet_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_SetSleepingAllowed_1 = Module["_emscripten_bind_b2Body_SetSleepingAllowed_1"] = createExportWrapper("emscripten_bind_b2Body_SetSleepingAllowed_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_IsSleepingAllowed_0 = Module["_emscripten_bind_b2Body_IsSleepingAllowed_0"] = createExportWrapper("emscripten_bind_b2Body_IsSleepingAllowed_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_SetAwake_1 = Module["_emscripten_bind_b2Body_SetAwake_1"] = createExportWrapper("emscripten_bind_b2Body_SetAwake_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_IsAwake_0 = Module["_emscripten_bind_b2Body_IsAwake_0"] = createExportWrapper("emscripten_bind_b2Body_IsAwake_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_SetEnabled_1 = Module["_emscripten_bind_b2Body_SetEnabled_1"] = createExportWrapper("emscripten_bind_b2Body_SetEnabled_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_IsEnabled_0 = Module["_emscripten_bind_b2Body_IsEnabled_0"] = createExportWrapper("emscripten_bind_b2Body_IsEnabled_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_SetFixedRotation_1 = Module["_emscripten_bind_b2Body_SetFixedRotation_1"] = createExportWrapper("emscripten_bind_b2Body_SetFixedRotation_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_IsFixedRotation_0 = Module["_emscripten_bind_b2Body_IsFixedRotation_0"] = createExportWrapper("emscripten_bind_b2Body_IsFixedRotation_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetFixtureList_0 = Module["_emscripten_bind_b2Body_GetFixtureList_0"] = createExportWrapper("emscripten_bind_b2Body_GetFixtureList_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetJointList_0 = Module["_emscripten_bind_b2Body_GetJointList_0"] = createExportWrapper("emscripten_bind_b2Body_GetJointList_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetContactList_0 = Module["_emscripten_bind_b2Body_GetContactList_0"] = createExportWrapper("emscripten_bind_b2Body_GetContactList_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetNext_0 = Module["_emscripten_bind_b2Body_GetNext_0"] = createExportWrapper("emscripten_bind_b2Body_GetNext_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetUserData_0 = Module["_emscripten_bind_b2Body_GetUserData_0"] = createExportWrapper("emscripten_bind_b2Body_GetUserData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_GetWorld_0 = Module["_emscripten_bind_b2Body_GetWorld_0"] = createExportWrapper("emscripten_bind_b2Body_GetWorld_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Body_Dump_0 = Module["_emscripten_bind_b2Body_Dump_0"] = createExportWrapper("emscripten_bind_b2Body_Dump_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_b2BodyDef_0 = Module["_emscripten_bind_b2BodyDef_b2BodyDef_0"] = createExportWrapper("emscripten_bind_b2BodyDef_b2BodyDef_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_get_type_0 = Module["_emscripten_bind_b2BodyDef_get_type_0"] = createExportWrapper("emscripten_bind_b2BodyDef_get_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_set_type_1 = Module["_emscripten_bind_b2BodyDef_set_type_1"] = createExportWrapper("emscripten_bind_b2BodyDef_set_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_get_position_0 = Module["_emscripten_bind_b2BodyDef_get_position_0"] = createExportWrapper("emscripten_bind_b2BodyDef_get_position_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_set_position_1 = Module["_emscripten_bind_b2BodyDef_set_position_1"] = createExportWrapper("emscripten_bind_b2BodyDef_set_position_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_get_angle_0 = Module["_emscripten_bind_b2BodyDef_get_angle_0"] = createExportWrapper("emscripten_bind_b2BodyDef_get_angle_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_set_angle_1 = Module["_emscripten_bind_b2BodyDef_set_angle_1"] = createExportWrapper("emscripten_bind_b2BodyDef_set_angle_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_get_linearVelocity_0 = Module["_emscripten_bind_b2BodyDef_get_linearVelocity_0"] = createExportWrapper("emscripten_bind_b2BodyDef_get_linearVelocity_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_set_linearVelocity_1 = Module["_emscripten_bind_b2BodyDef_set_linearVelocity_1"] = createExportWrapper("emscripten_bind_b2BodyDef_set_linearVelocity_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_get_angularVelocity_0 = Module["_emscripten_bind_b2BodyDef_get_angularVelocity_0"] = createExportWrapper("emscripten_bind_b2BodyDef_get_angularVelocity_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_set_angularVelocity_1 = Module["_emscripten_bind_b2BodyDef_set_angularVelocity_1"] = createExportWrapper("emscripten_bind_b2BodyDef_set_angularVelocity_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_get_linearDamping_0 = Module["_emscripten_bind_b2BodyDef_get_linearDamping_0"] = createExportWrapper("emscripten_bind_b2BodyDef_get_linearDamping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_set_linearDamping_1 = Module["_emscripten_bind_b2BodyDef_set_linearDamping_1"] = createExportWrapper("emscripten_bind_b2BodyDef_set_linearDamping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_get_angularDamping_0 = Module["_emscripten_bind_b2BodyDef_get_angularDamping_0"] = createExportWrapper("emscripten_bind_b2BodyDef_get_angularDamping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_set_angularDamping_1 = Module["_emscripten_bind_b2BodyDef_set_angularDamping_1"] = createExportWrapper("emscripten_bind_b2BodyDef_set_angularDamping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_get_allowSleep_0 = Module["_emscripten_bind_b2BodyDef_get_allowSleep_0"] = createExportWrapper("emscripten_bind_b2BodyDef_get_allowSleep_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_set_allowSleep_1 = Module["_emscripten_bind_b2BodyDef_set_allowSleep_1"] = createExportWrapper("emscripten_bind_b2BodyDef_set_allowSleep_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_get_awake_0 = Module["_emscripten_bind_b2BodyDef_get_awake_0"] = createExportWrapper("emscripten_bind_b2BodyDef_get_awake_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_set_awake_1 = Module["_emscripten_bind_b2BodyDef_set_awake_1"] = createExportWrapper("emscripten_bind_b2BodyDef_set_awake_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_get_fixedRotation_0 = Module["_emscripten_bind_b2BodyDef_get_fixedRotation_0"] = createExportWrapper("emscripten_bind_b2BodyDef_get_fixedRotation_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_set_fixedRotation_1 = Module["_emscripten_bind_b2BodyDef_set_fixedRotation_1"] = createExportWrapper("emscripten_bind_b2BodyDef_set_fixedRotation_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_get_bullet_0 = Module["_emscripten_bind_b2BodyDef_get_bullet_0"] = createExportWrapper("emscripten_bind_b2BodyDef_get_bullet_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_set_bullet_1 = Module["_emscripten_bind_b2BodyDef_set_bullet_1"] = createExportWrapper("emscripten_bind_b2BodyDef_set_bullet_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_get_enabled_0 = Module["_emscripten_bind_b2BodyDef_get_enabled_0"] = createExportWrapper("emscripten_bind_b2BodyDef_get_enabled_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_set_enabled_1 = Module["_emscripten_bind_b2BodyDef_set_enabled_1"] = createExportWrapper("emscripten_bind_b2BodyDef_set_enabled_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_get_userData_0 = Module["_emscripten_bind_b2BodyDef_get_userData_0"] = createExportWrapper("emscripten_bind_b2BodyDef_get_userData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_set_userData_1 = Module["_emscripten_bind_b2BodyDef_set_userData_1"] = createExportWrapper("emscripten_bind_b2BodyDef_set_userData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_get_gravityScale_0 = Module["_emscripten_bind_b2BodyDef_get_gravityScale_0"] = createExportWrapper("emscripten_bind_b2BodyDef_get_gravityScale_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef_set_gravityScale_1 = Module["_emscripten_bind_b2BodyDef_set_gravityScale_1"] = createExportWrapper("emscripten_bind_b2BodyDef_set_gravityScale_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2BodyDef___destroy___0 = Module["_emscripten_bind_b2BodyDef___destroy___0"] = createExportWrapper("emscripten_bind_b2BodyDef___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Filter_b2Filter_0 = Module["_emscripten_bind_b2Filter_b2Filter_0"] = createExportWrapper("emscripten_bind_b2Filter_b2Filter_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Filter_get_categoryBits_0 = Module["_emscripten_bind_b2Filter_get_categoryBits_0"] = createExportWrapper("emscripten_bind_b2Filter_get_categoryBits_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Filter_set_categoryBits_1 = Module["_emscripten_bind_b2Filter_set_categoryBits_1"] = createExportWrapper("emscripten_bind_b2Filter_set_categoryBits_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Filter_get_maskBits_0 = Module["_emscripten_bind_b2Filter_get_maskBits_0"] = createExportWrapper("emscripten_bind_b2Filter_get_maskBits_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Filter_set_maskBits_1 = Module["_emscripten_bind_b2Filter_set_maskBits_1"] = createExportWrapper("emscripten_bind_b2Filter_set_maskBits_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Filter_get_groupIndex_0 = Module["_emscripten_bind_b2Filter_get_groupIndex_0"] = createExportWrapper("emscripten_bind_b2Filter_get_groupIndex_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Filter_set_groupIndex_1 = Module["_emscripten_bind_b2Filter_set_groupIndex_1"] = createExportWrapper("emscripten_bind_b2Filter_set_groupIndex_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Filter___destroy___0 = Module["_emscripten_bind_b2Filter___destroy___0"] = createExportWrapper("emscripten_bind_b2Filter___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2AABB_b2AABB_0 = Module["_emscripten_bind_b2AABB_b2AABB_0"] = createExportWrapper("emscripten_bind_b2AABB_b2AABB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2AABB_IsValid_0 = Module["_emscripten_bind_b2AABB_IsValid_0"] = createExportWrapper("emscripten_bind_b2AABB_IsValid_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2AABB_GetCenter_0 = Module["_emscripten_bind_b2AABB_GetCenter_0"] = createExportWrapper("emscripten_bind_b2AABB_GetCenter_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2AABB_GetExtents_0 = Module["_emscripten_bind_b2AABB_GetExtents_0"] = createExportWrapper("emscripten_bind_b2AABB_GetExtents_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2AABB_GetPerimeter_0 = Module["_emscripten_bind_b2AABB_GetPerimeter_0"] = createExportWrapper("emscripten_bind_b2AABB_GetPerimeter_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2AABB_Combine_1 = Module["_emscripten_bind_b2AABB_Combine_1"] = createExportWrapper("emscripten_bind_b2AABB_Combine_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2AABB_Combine_2 = Module["_emscripten_bind_b2AABB_Combine_2"] = createExportWrapper("emscripten_bind_b2AABB_Combine_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2AABB_Contains_1 = Module["_emscripten_bind_b2AABB_Contains_1"] = createExportWrapper("emscripten_bind_b2AABB_Contains_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2AABB_RayCast_2 = Module["_emscripten_bind_b2AABB_RayCast_2"] = createExportWrapper("emscripten_bind_b2AABB_RayCast_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2AABB_get_lowerBound_0 = Module["_emscripten_bind_b2AABB_get_lowerBound_0"] = createExportWrapper("emscripten_bind_b2AABB_get_lowerBound_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2AABB_set_lowerBound_1 = Module["_emscripten_bind_b2AABB_set_lowerBound_1"] = createExportWrapper("emscripten_bind_b2AABB_set_lowerBound_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2AABB_get_upperBound_0 = Module["_emscripten_bind_b2AABB_get_upperBound_0"] = createExportWrapper("emscripten_bind_b2AABB_get_upperBound_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2AABB_set_upperBound_1 = Module["_emscripten_bind_b2AABB_set_upperBound_1"] = createExportWrapper("emscripten_bind_b2AABB_set_upperBound_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2AABB___destroy___0 = Module["_emscripten_bind_b2AABB___destroy___0"] = createExportWrapper("emscripten_bind_b2AABB___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2CircleShape_b2CircleShape_0 = Module["_emscripten_bind_b2CircleShape_b2CircleShape_0"] = createExportWrapper("emscripten_bind_b2CircleShape_b2CircleShape_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2CircleShape_GetType_0 = Module["_emscripten_bind_b2CircleShape_GetType_0"] = createExportWrapper("emscripten_bind_b2CircleShape_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2CircleShape_GetChildCount_0 = Module["_emscripten_bind_b2CircleShape_GetChildCount_0"] = createExportWrapper("emscripten_bind_b2CircleShape_GetChildCount_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2CircleShape_TestPoint_2 = Module["_emscripten_bind_b2CircleShape_TestPoint_2"] = createExportWrapper("emscripten_bind_b2CircleShape_TestPoint_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2CircleShape_RayCast_4 = Module["_emscripten_bind_b2CircleShape_RayCast_4"] = createExportWrapper("emscripten_bind_b2CircleShape_RayCast_4");

/** @type {function(...*):?} */
var _emscripten_bind_b2CircleShape_ComputeAABB_3 = Module["_emscripten_bind_b2CircleShape_ComputeAABB_3"] = createExportWrapper("emscripten_bind_b2CircleShape_ComputeAABB_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2CircleShape_ComputeMass_2 = Module["_emscripten_bind_b2CircleShape_ComputeMass_2"] = createExportWrapper("emscripten_bind_b2CircleShape_ComputeMass_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2CircleShape_get_m_p_0 = Module["_emscripten_bind_b2CircleShape_get_m_p_0"] = createExportWrapper("emscripten_bind_b2CircleShape_get_m_p_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2CircleShape_set_m_p_1 = Module["_emscripten_bind_b2CircleShape_set_m_p_1"] = createExportWrapper("emscripten_bind_b2CircleShape_set_m_p_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2CircleShape_get_m_type_0 = Module["_emscripten_bind_b2CircleShape_get_m_type_0"] = createExportWrapper("emscripten_bind_b2CircleShape_get_m_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2CircleShape_set_m_type_1 = Module["_emscripten_bind_b2CircleShape_set_m_type_1"] = createExportWrapper("emscripten_bind_b2CircleShape_set_m_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2CircleShape_get_m_radius_0 = Module["_emscripten_bind_b2CircleShape_get_m_radius_0"] = createExportWrapper("emscripten_bind_b2CircleShape_get_m_radius_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2CircleShape_set_m_radius_1 = Module["_emscripten_bind_b2CircleShape_set_m_radius_1"] = createExportWrapper("emscripten_bind_b2CircleShape_set_m_radius_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2CircleShape___destroy___0 = Module["_emscripten_bind_b2CircleShape___destroy___0"] = createExportWrapper("emscripten_bind_b2CircleShape___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_b2EdgeShape_0 = Module["_emscripten_bind_b2EdgeShape_b2EdgeShape_0"] = createExportWrapper("emscripten_bind_b2EdgeShape_b2EdgeShape_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_SetOneSided_4 = Module["_emscripten_bind_b2EdgeShape_SetOneSided_4"] = createExportWrapper("emscripten_bind_b2EdgeShape_SetOneSided_4");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_SetTwoSided_2 = Module["_emscripten_bind_b2EdgeShape_SetTwoSided_2"] = createExportWrapper("emscripten_bind_b2EdgeShape_SetTwoSided_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_GetType_0 = Module["_emscripten_bind_b2EdgeShape_GetType_0"] = createExportWrapper("emscripten_bind_b2EdgeShape_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_GetChildCount_0 = Module["_emscripten_bind_b2EdgeShape_GetChildCount_0"] = createExportWrapper("emscripten_bind_b2EdgeShape_GetChildCount_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_TestPoint_2 = Module["_emscripten_bind_b2EdgeShape_TestPoint_2"] = createExportWrapper("emscripten_bind_b2EdgeShape_TestPoint_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_RayCast_4 = Module["_emscripten_bind_b2EdgeShape_RayCast_4"] = createExportWrapper("emscripten_bind_b2EdgeShape_RayCast_4");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_ComputeAABB_3 = Module["_emscripten_bind_b2EdgeShape_ComputeAABB_3"] = createExportWrapper("emscripten_bind_b2EdgeShape_ComputeAABB_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_ComputeMass_2 = Module["_emscripten_bind_b2EdgeShape_ComputeMass_2"] = createExportWrapper("emscripten_bind_b2EdgeShape_ComputeMass_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_get_m_vertex1_0 = Module["_emscripten_bind_b2EdgeShape_get_m_vertex1_0"] = createExportWrapper("emscripten_bind_b2EdgeShape_get_m_vertex1_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_set_m_vertex1_1 = Module["_emscripten_bind_b2EdgeShape_set_m_vertex1_1"] = createExportWrapper("emscripten_bind_b2EdgeShape_set_m_vertex1_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_get_m_vertex2_0 = Module["_emscripten_bind_b2EdgeShape_get_m_vertex2_0"] = createExportWrapper("emscripten_bind_b2EdgeShape_get_m_vertex2_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_set_m_vertex2_1 = Module["_emscripten_bind_b2EdgeShape_set_m_vertex2_1"] = createExportWrapper("emscripten_bind_b2EdgeShape_set_m_vertex2_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_get_m_vertex0_0 = Module["_emscripten_bind_b2EdgeShape_get_m_vertex0_0"] = createExportWrapper("emscripten_bind_b2EdgeShape_get_m_vertex0_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_set_m_vertex0_1 = Module["_emscripten_bind_b2EdgeShape_set_m_vertex0_1"] = createExportWrapper("emscripten_bind_b2EdgeShape_set_m_vertex0_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_get_m_vertex3_0 = Module["_emscripten_bind_b2EdgeShape_get_m_vertex3_0"] = createExportWrapper("emscripten_bind_b2EdgeShape_get_m_vertex3_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_set_m_vertex3_1 = Module["_emscripten_bind_b2EdgeShape_set_m_vertex3_1"] = createExportWrapper("emscripten_bind_b2EdgeShape_set_m_vertex3_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_get_m_oneSided_0 = Module["_emscripten_bind_b2EdgeShape_get_m_oneSided_0"] = createExportWrapper("emscripten_bind_b2EdgeShape_get_m_oneSided_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_set_m_oneSided_1 = Module["_emscripten_bind_b2EdgeShape_set_m_oneSided_1"] = createExportWrapper("emscripten_bind_b2EdgeShape_set_m_oneSided_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_get_m_type_0 = Module["_emscripten_bind_b2EdgeShape_get_m_type_0"] = createExportWrapper("emscripten_bind_b2EdgeShape_get_m_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_set_m_type_1 = Module["_emscripten_bind_b2EdgeShape_set_m_type_1"] = createExportWrapper("emscripten_bind_b2EdgeShape_set_m_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_get_m_radius_0 = Module["_emscripten_bind_b2EdgeShape_get_m_radius_0"] = createExportWrapper("emscripten_bind_b2EdgeShape_get_m_radius_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape_set_m_radius_1 = Module["_emscripten_bind_b2EdgeShape_set_m_radius_1"] = createExportWrapper("emscripten_bind_b2EdgeShape_set_m_radius_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2EdgeShape___destroy___0 = Module["_emscripten_bind_b2EdgeShape___destroy___0"] = createExportWrapper("emscripten_bind_b2EdgeShape___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointUserData_get_pointer_0 = Module["_emscripten_bind_b2JointUserData_get_pointer_0"] = createExportWrapper("emscripten_bind_b2JointUserData_get_pointer_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointUserData_set_pointer_1 = Module["_emscripten_bind_b2JointUserData_set_pointer_1"] = createExportWrapper("emscripten_bind_b2JointUserData_set_pointer_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointUserData___destroy___0 = Module["_emscripten_bind_b2JointUserData___destroy___0"] = createExportWrapper("emscripten_bind_b2JointUserData___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_GetLocalAnchorA_0 = Module["_emscripten_bind_b2WeldJoint_GetLocalAnchorA_0"] = createExportWrapper("emscripten_bind_b2WeldJoint_GetLocalAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_GetLocalAnchorB_0 = Module["_emscripten_bind_b2WeldJoint_GetLocalAnchorB_0"] = createExportWrapper("emscripten_bind_b2WeldJoint_GetLocalAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_GetReferenceAngle_0 = Module["_emscripten_bind_b2WeldJoint_GetReferenceAngle_0"] = createExportWrapper("emscripten_bind_b2WeldJoint_GetReferenceAngle_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_SetStiffness_1 = Module["_emscripten_bind_b2WeldJoint_SetStiffness_1"] = createExportWrapper("emscripten_bind_b2WeldJoint_SetStiffness_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_GetStiffness_0 = Module["_emscripten_bind_b2WeldJoint_GetStiffness_0"] = createExportWrapper("emscripten_bind_b2WeldJoint_GetStiffness_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_SetDamping_1 = Module["_emscripten_bind_b2WeldJoint_SetDamping_1"] = createExportWrapper("emscripten_bind_b2WeldJoint_SetDamping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_GetDamping_0 = Module["_emscripten_bind_b2WeldJoint_GetDamping_0"] = createExportWrapper("emscripten_bind_b2WeldJoint_GetDamping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_Dump_0 = Module["_emscripten_bind_b2WeldJoint_Dump_0"] = createExportWrapper("emscripten_bind_b2WeldJoint_Dump_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_GetType_0 = Module["_emscripten_bind_b2WeldJoint_GetType_0"] = createExportWrapper("emscripten_bind_b2WeldJoint_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_GetBodyA_0 = Module["_emscripten_bind_b2WeldJoint_GetBodyA_0"] = createExportWrapper("emscripten_bind_b2WeldJoint_GetBodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_GetBodyB_0 = Module["_emscripten_bind_b2WeldJoint_GetBodyB_0"] = createExportWrapper("emscripten_bind_b2WeldJoint_GetBodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_GetAnchorA_0 = Module["_emscripten_bind_b2WeldJoint_GetAnchorA_0"] = createExportWrapper("emscripten_bind_b2WeldJoint_GetAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_GetAnchorB_0 = Module["_emscripten_bind_b2WeldJoint_GetAnchorB_0"] = createExportWrapper("emscripten_bind_b2WeldJoint_GetAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_GetReactionForce_1 = Module["_emscripten_bind_b2WeldJoint_GetReactionForce_1"] = createExportWrapper("emscripten_bind_b2WeldJoint_GetReactionForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_GetReactionTorque_1 = Module["_emscripten_bind_b2WeldJoint_GetReactionTorque_1"] = createExportWrapper("emscripten_bind_b2WeldJoint_GetReactionTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_GetNext_0 = Module["_emscripten_bind_b2WeldJoint_GetNext_0"] = createExportWrapper("emscripten_bind_b2WeldJoint_GetNext_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_GetUserData_0 = Module["_emscripten_bind_b2WeldJoint_GetUserData_0"] = createExportWrapper("emscripten_bind_b2WeldJoint_GetUserData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint_GetCollideConnected_0 = Module["_emscripten_bind_b2WeldJoint_GetCollideConnected_0"] = createExportWrapper("emscripten_bind_b2WeldJoint_GetCollideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJoint___destroy___0 = Module["_emscripten_bind_b2WeldJoint___destroy___0"] = createExportWrapper("emscripten_bind_b2WeldJoint___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_b2WeldJointDef_0 = Module["_emscripten_bind_b2WeldJointDef_b2WeldJointDef_0"] = createExportWrapper("emscripten_bind_b2WeldJointDef_b2WeldJointDef_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_Initialize_3 = Module["_emscripten_bind_b2WeldJointDef_Initialize_3"] = createExportWrapper("emscripten_bind_b2WeldJointDef_Initialize_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_get_localAnchorA_0 = Module["_emscripten_bind_b2WeldJointDef_get_localAnchorA_0"] = createExportWrapper("emscripten_bind_b2WeldJointDef_get_localAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_set_localAnchorA_1 = Module["_emscripten_bind_b2WeldJointDef_set_localAnchorA_1"] = createExportWrapper("emscripten_bind_b2WeldJointDef_set_localAnchorA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_get_localAnchorB_0 = Module["_emscripten_bind_b2WeldJointDef_get_localAnchorB_0"] = createExportWrapper("emscripten_bind_b2WeldJointDef_get_localAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_set_localAnchorB_1 = Module["_emscripten_bind_b2WeldJointDef_set_localAnchorB_1"] = createExportWrapper("emscripten_bind_b2WeldJointDef_set_localAnchorB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_get_referenceAngle_0 = Module["_emscripten_bind_b2WeldJointDef_get_referenceAngle_0"] = createExportWrapper("emscripten_bind_b2WeldJointDef_get_referenceAngle_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_set_referenceAngle_1 = Module["_emscripten_bind_b2WeldJointDef_set_referenceAngle_1"] = createExportWrapper("emscripten_bind_b2WeldJointDef_set_referenceAngle_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_get_stiffness_0 = Module["_emscripten_bind_b2WeldJointDef_get_stiffness_0"] = createExportWrapper("emscripten_bind_b2WeldJointDef_get_stiffness_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_set_stiffness_1 = Module["_emscripten_bind_b2WeldJointDef_set_stiffness_1"] = createExportWrapper("emscripten_bind_b2WeldJointDef_set_stiffness_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_get_damping_0 = Module["_emscripten_bind_b2WeldJointDef_get_damping_0"] = createExportWrapper("emscripten_bind_b2WeldJointDef_get_damping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_set_damping_1 = Module["_emscripten_bind_b2WeldJointDef_set_damping_1"] = createExportWrapper("emscripten_bind_b2WeldJointDef_set_damping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_get_type_0 = Module["_emscripten_bind_b2WeldJointDef_get_type_0"] = createExportWrapper("emscripten_bind_b2WeldJointDef_get_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_set_type_1 = Module["_emscripten_bind_b2WeldJointDef_set_type_1"] = createExportWrapper("emscripten_bind_b2WeldJointDef_set_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_get_userData_0 = Module["_emscripten_bind_b2WeldJointDef_get_userData_0"] = createExportWrapper("emscripten_bind_b2WeldJointDef_get_userData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_set_userData_1 = Module["_emscripten_bind_b2WeldJointDef_set_userData_1"] = createExportWrapper("emscripten_bind_b2WeldJointDef_set_userData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_get_bodyA_0 = Module["_emscripten_bind_b2WeldJointDef_get_bodyA_0"] = createExportWrapper("emscripten_bind_b2WeldJointDef_get_bodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_set_bodyA_1 = Module["_emscripten_bind_b2WeldJointDef_set_bodyA_1"] = createExportWrapper("emscripten_bind_b2WeldJointDef_set_bodyA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_get_bodyB_0 = Module["_emscripten_bind_b2WeldJointDef_get_bodyB_0"] = createExportWrapper("emscripten_bind_b2WeldJointDef_get_bodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_set_bodyB_1 = Module["_emscripten_bind_b2WeldJointDef_set_bodyB_1"] = createExportWrapper("emscripten_bind_b2WeldJointDef_set_bodyB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_get_collideConnected_0 = Module["_emscripten_bind_b2WeldJointDef_get_collideConnected_0"] = createExportWrapper("emscripten_bind_b2WeldJointDef_get_collideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef_set_collideConnected_1 = Module["_emscripten_bind_b2WeldJointDef_set_collideConnected_1"] = createExportWrapper("emscripten_bind_b2WeldJointDef_set_collideConnected_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WeldJointDef___destroy___0 = Module["_emscripten_bind_b2WeldJointDef___destroy___0"] = createExportWrapper("emscripten_bind_b2WeldJointDef___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_b2ChainShape_0 = Module["_emscripten_bind_b2ChainShape_b2ChainShape_0"] = createExportWrapper("emscripten_bind_b2ChainShape_b2ChainShape_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_Clear_0 = Module["_emscripten_bind_b2ChainShape_Clear_0"] = createExportWrapper("emscripten_bind_b2ChainShape_Clear_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_CreateLoop_2 = Module["_emscripten_bind_b2ChainShape_CreateLoop_2"] = createExportWrapper("emscripten_bind_b2ChainShape_CreateLoop_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_CreateChain_4 = Module["_emscripten_bind_b2ChainShape_CreateChain_4"] = createExportWrapper("emscripten_bind_b2ChainShape_CreateChain_4");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_GetChildEdge_2 = Module["_emscripten_bind_b2ChainShape_GetChildEdge_2"] = createExportWrapper("emscripten_bind_b2ChainShape_GetChildEdge_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_GetType_0 = Module["_emscripten_bind_b2ChainShape_GetType_0"] = createExportWrapper("emscripten_bind_b2ChainShape_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_GetChildCount_0 = Module["_emscripten_bind_b2ChainShape_GetChildCount_0"] = createExportWrapper("emscripten_bind_b2ChainShape_GetChildCount_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_TestPoint_2 = Module["_emscripten_bind_b2ChainShape_TestPoint_2"] = createExportWrapper("emscripten_bind_b2ChainShape_TestPoint_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_RayCast_4 = Module["_emscripten_bind_b2ChainShape_RayCast_4"] = createExportWrapper("emscripten_bind_b2ChainShape_RayCast_4");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_ComputeAABB_3 = Module["_emscripten_bind_b2ChainShape_ComputeAABB_3"] = createExportWrapper("emscripten_bind_b2ChainShape_ComputeAABB_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_ComputeMass_2 = Module["_emscripten_bind_b2ChainShape_ComputeMass_2"] = createExportWrapper("emscripten_bind_b2ChainShape_ComputeMass_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_get_m_vertices_0 = Module["_emscripten_bind_b2ChainShape_get_m_vertices_0"] = createExportWrapper("emscripten_bind_b2ChainShape_get_m_vertices_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_set_m_vertices_1 = Module["_emscripten_bind_b2ChainShape_set_m_vertices_1"] = createExportWrapper("emscripten_bind_b2ChainShape_set_m_vertices_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_get_m_count_0 = Module["_emscripten_bind_b2ChainShape_get_m_count_0"] = createExportWrapper("emscripten_bind_b2ChainShape_get_m_count_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_set_m_count_1 = Module["_emscripten_bind_b2ChainShape_set_m_count_1"] = createExportWrapper("emscripten_bind_b2ChainShape_set_m_count_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_get_m_prevVertex_0 = Module["_emscripten_bind_b2ChainShape_get_m_prevVertex_0"] = createExportWrapper("emscripten_bind_b2ChainShape_get_m_prevVertex_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_set_m_prevVertex_1 = Module["_emscripten_bind_b2ChainShape_set_m_prevVertex_1"] = createExportWrapper("emscripten_bind_b2ChainShape_set_m_prevVertex_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_get_m_nextVertex_0 = Module["_emscripten_bind_b2ChainShape_get_m_nextVertex_0"] = createExportWrapper("emscripten_bind_b2ChainShape_get_m_nextVertex_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_set_m_nextVertex_1 = Module["_emscripten_bind_b2ChainShape_set_m_nextVertex_1"] = createExportWrapper("emscripten_bind_b2ChainShape_set_m_nextVertex_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_get_m_type_0 = Module["_emscripten_bind_b2ChainShape_get_m_type_0"] = createExportWrapper("emscripten_bind_b2ChainShape_get_m_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_set_m_type_1 = Module["_emscripten_bind_b2ChainShape_set_m_type_1"] = createExportWrapper("emscripten_bind_b2ChainShape_set_m_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_get_m_radius_0 = Module["_emscripten_bind_b2ChainShape_get_m_radius_0"] = createExportWrapper("emscripten_bind_b2ChainShape_get_m_radius_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape_set_m_radius_1 = Module["_emscripten_bind_b2ChainShape_set_m_radius_1"] = createExportWrapper("emscripten_bind_b2ChainShape_set_m_radius_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ChainShape___destroy___0 = Module["_emscripten_bind_b2ChainShape___destroy___0"] = createExportWrapper("emscripten_bind_b2ChainShape___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Color_b2Color_0 = Module["_emscripten_bind_b2Color_b2Color_0"] = createExportWrapper("emscripten_bind_b2Color_b2Color_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Color_b2Color_3 = Module["_emscripten_bind_b2Color_b2Color_3"] = createExportWrapper("emscripten_bind_b2Color_b2Color_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2Color_Set_3 = Module["_emscripten_bind_b2Color_Set_3"] = createExportWrapper("emscripten_bind_b2Color_Set_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2Color_get_r_0 = Module["_emscripten_bind_b2Color_get_r_0"] = createExportWrapper("emscripten_bind_b2Color_get_r_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Color_set_r_1 = Module["_emscripten_bind_b2Color_set_r_1"] = createExportWrapper("emscripten_bind_b2Color_set_r_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Color_get_g_0 = Module["_emscripten_bind_b2Color_get_g_0"] = createExportWrapper("emscripten_bind_b2Color_get_g_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Color_set_g_1 = Module["_emscripten_bind_b2Color_set_g_1"] = createExportWrapper("emscripten_bind_b2Color_set_g_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Color_get_b_0 = Module["_emscripten_bind_b2Color_get_b_0"] = createExportWrapper("emscripten_bind_b2Color_get_b_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Color_set_b_1 = Module["_emscripten_bind_b2Color_set_b_1"] = createExportWrapper("emscripten_bind_b2Color_set_b_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Color___destroy___0 = Module["_emscripten_bind_b2Color___destroy___0"] = createExportWrapper("emscripten_bind_b2Color___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactEdge_b2ContactEdge_0 = Module["_emscripten_bind_b2ContactEdge_b2ContactEdge_0"] = createExportWrapper("emscripten_bind_b2ContactEdge_b2ContactEdge_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactEdge_get_other_0 = Module["_emscripten_bind_b2ContactEdge_get_other_0"] = createExportWrapper("emscripten_bind_b2ContactEdge_get_other_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactEdge_set_other_1 = Module["_emscripten_bind_b2ContactEdge_set_other_1"] = createExportWrapper("emscripten_bind_b2ContactEdge_set_other_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactEdge_get_contact_0 = Module["_emscripten_bind_b2ContactEdge_get_contact_0"] = createExportWrapper("emscripten_bind_b2ContactEdge_get_contact_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactEdge_set_contact_1 = Module["_emscripten_bind_b2ContactEdge_set_contact_1"] = createExportWrapper("emscripten_bind_b2ContactEdge_set_contact_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactEdge_get_prev_0 = Module["_emscripten_bind_b2ContactEdge_get_prev_0"] = createExportWrapper("emscripten_bind_b2ContactEdge_get_prev_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactEdge_set_prev_1 = Module["_emscripten_bind_b2ContactEdge_set_prev_1"] = createExportWrapper("emscripten_bind_b2ContactEdge_set_prev_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactEdge_get_next_0 = Module["_emscripten_bind_b2ContactEdge_get_next_0"] = createExportWrapper("emscripten_bind_b2ContactEdge_get_next_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactEdge_set_next_1 = Module["_emscripten_bind_b2ContactEdge_set_next_1"] = createExportWrapper("emscripten_bind_b2ContactEdge_set_next_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactEdge___destroy___0 = Module["_emscripten_bind_b2ContactEdge___destroy___0"] = createExportWrapper("emscripten_bind_b2ContactEdge___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactFeature_get_indexA_0 = Module["_emscripten_bind_b2ContactFeature_get_indexA_0"] = createExportWrapper("emscripten_bind_b2ContactFeature_get_indexA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactFeature_set_indexA_1 = Module["_emscripten_bind_b2ContactFeature_set_indexA_1"] = createExportWrapper("emscripten_bind_b2ContactFeature_set_indexA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactFeature_get_indexB_0 = Module["_emscripten_bind_b2ContactFeature_get_indexB_0"] = createExportWrapper("emscripten_bind_b2ContactFeature_get_indexB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactFeature_set_indexB_1 = Module["_emscripten_bind_b2ContactFeature_set_indexB_1"] = createExportWrapper("emscripten_bind_b2ContactFeature_set_indexB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactFeature_get_typeA_0 = Module["_emscripten_bind_b2ContactFeature_get_typeA_0"] = createExportWrapper("emscripten_bind_b2ContactFeature_get_typeA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactFeature_set_typeA_1 = Module["_emscripten_bind_b2ContactFeature_set_typeA_1"] = createExportWrapper("emscripten_bind_b2ContactFeature_set_typeA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactFeature_get_typeB_0 = Module["_emscripten_bind_b2ContactFeature_get_typeB_0"] = createExportWrapper("emscripten_bind_b2ContactFeature_get_typeB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactFeature_set_typeB_1 = Module["_emscripten_bind_b2ContactFeature_set_typeB_1"] = createExportWrapper("emscripten_bind_b2ContactFeature_set_typeB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactFeature___destroy___0 = Module["_emscripten_bind_b2ContactFeature___destroy___0"] = createExportWrapper("emscripten_bind_b2ContactFeature___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_JSContactFilter_JSContactFilter_0 = Module["_emscripten_bind_JSContactFilter_JSContactFilter_0"] = createExportWrapper("emscripten_bind_JSContactFilter_JSContactFilter_0");

/** @type {function(...*):?} */
var _emscripten_bind_JSContactFilter_ShouldCollide_2 = Module["_emscripten_bind_JSContactFilter_ShouldCollide_2"] = createExportWrapper("emscripten_bind_JSContactFilter_ShouldCollide_2");

/** @type {function(...*):?} */
var _emscripten_bind_JSContactFilter___destroy___0 = Module["_emscripten_bind_JSContactFilter___destroy___0"] = createExportWrapper("emscripten_bind_JSContactFilter___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactID_get_cf_0 = Module["_emscripten_bind_b2ContactID_get_cf_0"] = createExportWrapper("emscripten_bind_b2ContactID_get_cf_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactID_set_cf_1 = Module["_emscripten_bind_b2ContactID_set_cf_1"] = createExportWrapper("emscripten_bind_b2ContactID_set_cf_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactID_get_key_0 = Module["_emscripten_bind_b2ContactID_get_key_0"] = createExportWrapper("emscripten_bind_b2ContactID_get_key_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactID_set_key_1 = Module["_emscripten_bind_b2ContactID_set_key_1"] = createExportWrapper("emscripten_bind_b2ContactID_set_key_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactID___destroy___0 = Module["_emscripten_bind_b2ContactID___destroy___0"] = createExportWrapper("emscripten_bind_b2ContactID___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactImpulse_get_normalImpulses_1 = Module["_emscripten_bind_b2ContactImpulse_get_normalImpulses_1"] = createExportWrapper("emscripten_bind_b2ContactImpulse_get_normalImpulses_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactImpulse_set_normalImpulses_2 = Module["_emscripten_bind_b2ContactImpulse_set_normalImpulses_2"] = createExportWrapper("emscripten_bind_b2ContactImpulse_set_normalImpulses_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactImpulse_get_tangentImpulses_1 = Module["_emscripten_bind_b2ContactImpulse_get_tangentImpulses_1"] = createExportWrapper("emscripten_bind_b2ContactImpulse_get_tangentImpulses_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactImpulse_set_tangentImpulses_2 = Module["_emscripten_bind_b2ContactImpulse_set_tangentImpulses_2"] = createExportWrapper("emscripten_bind_b2ContactImpulse_set_tangentImpulses_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactImpulse_get_count_0 = Module["_emscripten_bind_b2ContactImpulse_get_count_0"] = createExportWrapper("emscripten_bind_b2ContactImpulse_get_count_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactImpulse_set_count_1 = Module["_emscripten_bind_b2ContactImpulse_set_count_1"] = createExportWrapper("emscripten_bind_b2ContactImpulse_set_count_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ContactImpulse___destroy___0 = Module["_emscripten_bind_b2ContactImpulse___destroy___0"] = createExportWrapper("emscripten_bind_b2ContactImpulse___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DestructionListener___destroy___0 = Module["_emscripten_bind_b2DestructionListener___destroy___0"] = createExportWrapper("emscripten_bind_b2DestructionListener___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_JSDestructionListener_JSDestructionListener_0 = Module["_emscripten_bind_JSDestructionListener_JSDestructionListener_0"] = createExportWrapper("emscripten_bind_JSDestructionListener_JSDestructionListener_0");

/** @type {function(...*):?} */
var _emscripten_bind_JSDestructionListener_SayGoodbyeJoint_1 = Module["_emscripten_bind_JSDestructionListener_SayGoodbyeJoint_1"] = createExportWrapper("emscripten_bind_JSDestructionListener_SayGoodbyeJoint_1");

/** @type {function(...*):?} */
var _emscripten_bind_JSDestructionListener_SayGoodbyeFixture_1 = Module["_emscripten_bind_JSDestructionListener_SayGoodbyeFixture_1"] = createExportWrapper("emscripten_bind_JSDestructionListener_SayGoodbyeFixture_1");

/** @type {function(...*):?} */
var _emscripten_bind_JSDestructionListener___destroy___0 = Module["_emscripten_bind_JSDestructionListener___destroy___0"] = createExportWrapper("emscripten_bind_JSDestructionListener___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetLocalAnchorA_0 = Module["_emscripten_bind_b2DistanceJoint_GetLocalAnchorA_0"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetLocalAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetLocalAnchorB_0 = Module["_emscripten_bind_b2DistanceJoint_GetLocalAnchorB_0"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetLocalAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetLength_0 = Module["_emscripten_bind_b2DistanceJoint_GetLength_0"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetLength_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_SetLength_1 = Module["_emscripten_bind_b2DistanceJoint_SetLength_1"] = createExportWrapper("emscripten_bind_b2DistanceJoint_SetLength_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetMinLength_0 = Module["_emscripten_bind_b2DistanceJoint_GetMinLength_0"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetMinLength_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_SetMinLength_1 = Module["_emscripten_bind_b2DistanceJoint_SetMinLength_1"] = createExportWrapper("emscripten_bind_b2DistanceJoint_SetMinLength_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetMaxLength_0 = Module["_emscripten_bind_b2DistanceJoint_GetMaxLength_0"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetMaxLength_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_SetMaxLength_1 = Module["_emscripten_bind_b2DistanceJoint_SetMaxLength_1"] = createExportWrapper("emscripten_bind_b2DistanceJoint_SetMaxLength_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetCurrentLength_0 = Module["_emscripten_bind_b2DistanceJoint_GetCurrentLength_0"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetCurrentLength_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_SetStiffness_1 = Module["_emscripten_bind_b2DistanceJoint_SetStiffness_1"] = createExportWrapper("emscripten_bind_b2DistanceJoint_SetStiffness_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetStiffness_0 = Module["_emscripten_bind_b2DistanceJoint_GetStiffness_0"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetStiffness_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_SetDamping_1 = Module["_emscripten_bind_b2DistanceJoint_SetDamping_1"] = createExportWrapper("emscripten_bind_b2DistanceJoint_SetDamping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetDamping_0 = Module["_emscripten_bind_b2DistanceJoint_GetDamping_0"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetDamping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetType_0 = Module["_emscripten_bind_b2DistanceJoint_GetType_0"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetBodyA_0 = Module["_emscripten_bind_b2DistanceJoint_GetBodyA_0"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetBodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetBodyB_0 = Module["_emscripten_bind_b2DistanceJoint_GetBodyB_0"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetBodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetAnchorA_0 = Module["_emscripten_bind_b2DistanceJoint_GetAnchorA_0"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetAnchorB_0 = Module["_emscripten_bind_b2DistanceJoint_GetAnchorB_0"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetReactionForce_1 = Module["_emscripten_bind_b2DistanceJoint_GetReactionForce_1"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetReactionForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetReactionTorque_1 = Module["_emscripten_bind_b2DistanceJoint_GetReactionTorque_1"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetReactionTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetNext_0 = Module["_emscripten_bind_b2DistanceJoint_GetNext_0"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetNext_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetUserData_0 = Module["_emscripten_bind_b2DistanceJoint_GetUserData_0"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetUserData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint_GetCollideConnected_0 = Module["_emscripten_bind_b2DistanceJoint_GetCollideConnected_0"] = createExportWrapper("emscripten_bind_b2DistanceJoint_GetCollideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJoint___destroy___0 = Module["_emscripten_bind_b2DistanceJoint___destroy___0"] = createExportWrapper("emscripten_bind_b2DistanceJoint___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_b2DistanceJointDef_0 = Module["_emscripten_bind_b2DistanceJointDef_b2DistanceJointDef_0"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_b2DistanceJointDef_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_Initialize_4 = Module["_emscripten_bind_b2DistanceJointDef_Initialize_4"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_Initialize_4");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_get_localAnchorA_0 = Module["_emscripten_bind_b2DistanceJointDef_get_localAnchorA_0"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_get_localAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_set_localAnchorA_1 = Module["_emscripten_bind_b2DistanceJointDef_set_localAnchorA_1"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_set_localAnchorA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_get_localAnchorB_0 = Module["_emscripten_bind_b2DistanceJointDef_get_localAnchorB_0"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_get_localAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_set_localAnchorB_1 = Module["_emscripten_bind_b2DistanceJointDef_set_localAnchorB_1"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_set_localAnchorB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_get_length_0 = Module["_emscripten_bind_b2DistanceJointDef_get_length_0"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_get_length_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_set_length_1 = Module["_emscripten_bind_b2DistanceJointDef_set_length_1"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_set_length_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_get_minLength_0 = Module["_emscripten_bind_b2DistanceJointDef_get_minLength_0"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_get_minLength_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_set_minLength_1 = Module["_emscripten_bind_b2DistanceJointDef_set_minLength_1"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_set_minLength_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_get_maxLength_0 = Module["_emscripten_bind_b2DistanceJointDef_get_maxLength_0"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_get_maxLength_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_set_maxLength_1 = Module["_emscripten_bind_b2DistanceJointDef_set_maxLength_1"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_set_maxLength_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_get_stiffness_0 = Module["_emscripten_bind_b2DistanceJointDef_get_stiffness_0"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_get_stiffness_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_set_stiffness_1 = Module["_emscripten_bind_b2DistanceJointDef_set_stiffness_1"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_set_stiffness_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_get_damping_0 = Module["_emscripten_bind_b2DistanceJointDef_get_damping_0"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_get_damping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_set_damping_1 = Module["_emscripten_bind_b2DistanceJointDef_set_damping_1"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_set_damping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_get_type_0 = Module["_emscripten_bind_b2DistanceJointDef_get_type_0"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_get_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_set_type_1 = Module["_emscripten_bind_b2DistanceJointDef_set_type_1"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_set_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_get_userData_0 = Module["_emscripten_bind_b2DistanceJointDef_get_userData_0"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_get_userData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_set_userData_1 = Module["_emscripten_bind_b2DistanceJointDef_set_userData_1"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_set_userData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_get_bodyA_0 = Module["_emscripten_bind_b2DistanceJointDef_get_bodyA_0"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_get_bodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_set_bodyA_1 = Module["_emscripten_bind_b2DistanceJointDef_set_bodyA_1"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_set_bodyA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_get_bodyB_0 = Module["_emscripten_bind_b2DistanceJointDef_get_bodyB_0"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_get_bodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_set_bodyB_1 = Module["_emscripten_bind_b2DistanceJointDef_set_bodyB_1"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_set_bodyB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_get_collideConnected_0 = Module["_emscripten_bind_b2DistanceJointDef_get_collideConnected_0"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_get_collideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef_set_collideConnected_1 = Module["_emscripten_bind_b2DistanceJointDef_set_collideConnected_1"] = createExportWrapper("emscripten_bind_b2DistanceJointDef_set_collideConnected_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2DistanceJointDef___destroy___0 = Module["_emscripten_bind_b2DistanceJointDef___destroy___0"] = createExportWrapper("emscripten_bind_b2DistanceJointDef___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_JSDraw_JSDraw_0 = Module["_emscripten_bind_JSDraw_JSDraw_0"] = createExportWrapper("emscripten_bind_JSDraw_JSDraw_0");

/** @type {function(...*):?} */
var _emscripten_bind_JSDraw_DrawPolygon_3 = Module["_emscripten_bind_JSDraw_DrawPolygon_3"] = createExportWrapper("emscripten_bind_JSDraw_DrawPolygon_3");

/** @type {function(...*):?} */
var _emscripten_bind_JSDraw_DrawSolidPolygon_3 = Module["_emscripten_bind_JSDraw_DrawSolidPolygon_3"] = createExportWrapper("emscripten_bind_JSDraw_DrawSolidPolygon_3");

/** @type {function(...*):?} */
var _emscripten_bind_JSDraw_DrawCircle_3 = Module["_emscripten_bind_JSDraw_DrawCircle_3"] = createExportWrapper("emscripten_bind_JSDraw_DrawCircle_3");

/** @type {function(...*):?} */
var _emscripten_bind_JSDraw_DrawSolidCircle_4 = Module["_emscripten_bind_JSDraw_DrawSolidCircle_4"] = createExportWrapper("emscripten_bind_JSDraw_DrawSolidCircle_4");

/** @type {function(...*):?} */
var _emscripten_bind_JSDraw_DrawSegment_3 = Module["_emscripten_bind_JSDraw_DrawSegment_3"] = createExportWrapper("emscripten_bind_JSDraw_DrawSegment_3");

/** @type {function(...*):?} */
var _emscripten_bind_JSDraw_DrawTransform_1 = Module["_emscripten_bind_JSDraw_DrawTransform_1"] = createExportWrapper("emscripten_bind_JSDraw_DrawTransform_1");

/** @type {function(...*):?} */
var _emscripten_bind_JSDraw_DrawPoint_3 = Module["_emscripten_bind_JSDraw_DrawPoint_3"] = createExportWrapper("emscripten_bind_JSDraw_DrawPoint_3");

/** @type {function(...*):?} */
var _emscripten_bind_JSDraw___destroy___0 = Module["_emscripten_bind_JSDraw___destroy___0"] = createExportWrapper("emscripten_bind_JSDraw___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint_GetLocalAnchorA_0 = Module["_emscripten_bind_b2FrictionJoint_GetLocalAnchorA_0"] = createExportWrapper("emscripten_bind_b2FrictionJoint_GetLocalAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint_GetLocalAnchorB_0 = Module["_emscripten_bind_b2FrictionJoint_GetLocalAnchorB_0"] = createExportWrapper("emscripten_bind_b2FrictionJoint_GetLocalAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint_SetMaxForce_1 = Module["_emscripten_bind_b2FrictionJoint_SetMaxForce_1"] = createExportWrapper("emscripten_bind_b2FrictionJoint_SetMaxForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint_GetMaxForce_0 = Module["_emscripten_bind_b2FrictionJoint_GetMaxForce_0"] = createExportWrapper("emscripten_bind_b2FrictionJoint_GetMaxForce_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint_SetMaxTorque_1 = Module["_emscripten_bind_b2FrictionJoint_SetMaxTorque_1"] = createExportWrapper("emscripten_bind_b2FrictionJoint_SetMaxTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint_GetMaxTorque_0 = Module["_emscripten_bind_b2FrictionJoint_GetMaxTorque_0"] = createExportWrapper("emscripten_bind_b2FrictionJoint_GetMaxTorque_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint_GetType_0 = Module["_emscripten_bind_b2FrictionJoint_GetType_0"] = createExportWrapper("emscripten_bind_b2FrictionJoint_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint_GetBodyA_0 = Module["_emscripten_bind_b2FrictionJoint_GetBodyA_0"] = createExportWrapper("emscripten_bind_b2FrictionJoint_GetBodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint_GetBodyB_0 = Module["_emscripten_bind_b2FrictionJoint_GetBodyB_0"] = createExportWrapper("emscripten_bind_b2FrictionJoint_GetBodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint_GetAnchorA_0 = Module["_emscripten_bind_b2FrictionJoint_GetAnchorA_0"] = createExportWrapper("emscripten_bind_b2FrictionJoint_GetAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint_GetAnchorB_0 = Module["_emscripten_bind_b2FrictionJoint_GetAnchorB_0"] = createExportWrapper("emscripten_bind_b2FrictionJoint_GetAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint_GetReactionForce_1 = Module["_emscripten_bind_b2FrictionJoint_GetReactionForce_1"] = createExportWrapper("emscripten_bind_b2FrictionJoint_GetReactionForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint_GetReactionTorque_1 = Module["_emscripten_bind_b2FrictionJoint_GetReactionTorque_1"] = createExportWrapper("emscripten_bind_b2FrictionJoint_GetReactionTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint_GetNext_0 = Module["_emscripten_bind_b2FrictionJoint_GetNext_0"] = createExportWrapper("emscripten_bind_b2FrictionJoint_GetNext_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint_GetUserData_0 = Module["_emscripten_bind_b2FrictionJoint_GetUserData_0"] = createExportWrapper("emscripten_bind_b2FrictionJoint_GetUserData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint_GetCollideConnected_0 = Module["_emscripten_bind_b2FrictionJoint_GetCollideConnected_0"] = createExportWrapper("emscripten_bind_b2FrictionJoint_GetCollideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJoint___destroy___0 = Module["_emscripten_bind_b2FrictionJoint___destroy___0"] = createExportWrapper("emscripten_bind_b2FrictionJoint___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_b2FrictionJointDef_0 = Module["_emscripten_bind_b2FrictionJointDef_b2FrictionJointDef_0"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_b2FrictionJointDef_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_Initialize_3 = Module["_emscripten_bind_b2FrictionJointDef_Initialize_3"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_Initialize_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_get_localAnchorA_0 = Module["_emscripten_bind_b2FrictionJointDef_get_localAnchorA_0"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_get_localAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_set_localAnchorA_1 = Module["_emscripten_bind_b2FrictionJointDef_set_localAnchorA_1"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_set_localAnchorA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_get_localAnchorB_0 = Module["_emscripten_bind_b2FrictionJointDef_get_localAnchorB_0"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_get_localAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_set_localAnchorB_1 = Module["_emscripten_bind_b2FrictionJointDef_set_localAnchorB_1"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_set_localAnchorB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_get_maxForce_0 = Module["_emscripten_bind_b2FrictionJointDef_get_maxForce_0"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_get_maxForce_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_set_maxForce_1 = Module["_emscripten_bind_b2FrictionJointDef_set_maxForce_1"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_set_maxForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_get_maxTorque_0 = Module["_emscripten_bind_b2FrictionJointDef_get_maxTorque_0"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_get_maxTorque_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_set_maxTorque_1 = Module["_emscripten_bind_b2FrictionJointDef_set_maxTorque_1"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_set_maxTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_get_type_0 = Module["_emscripten_bind_b2FrictionJointDef_get_type_0"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_get_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_set_type_1 = Module["_emscripten_bind_b2FrictionJointDef_set_type_1"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_set_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_get_userData_0 = Module["_emscripten_bind_b2FrictionJointDef_get_userData_0"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_get_userData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_set_userData_1 = Module["_emscripten_bind_b2FrictionJointDef_set_userData_1"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_set_userData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_get_bodyA_0 = Module["_emscripten_bind_b2FrictionJointDef_get_bodyA_0"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_get_bodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_set_bodyA_1 = Module["_emscripten_bind_b2FrictionJointDef_set_bodyA_1"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_set_bodyA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_get_bodyB_0 = Module["_emscripten_bind_b2FrictionJointDef_get_bodyB_0"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_get_bodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_set_bodyB_1 = Module["_emscripten_bind_b2FrictionJointDef_set_bodyB_1"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_set_bodyB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_get_collideConnected_0 = Module["_emscripten_bind_b2FrictionJointDef_get_collideConnected_0"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_get_collideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef_set_collideConnected_1 = Module["_emscripten_bind_b2FrictionJointDef_set_collideConnected_1"] = createExportWrapper("emscripten_bind_b2FrictionJointDef_set_collideConnected_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2FrictionJointDef___destroy___0 = Module["_emscripten_bind_b2FrictionJointDef___destroy___0"] = createExportWrapper("emscripten_bind_b2FrictionJointDef___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJoint_GetJoint1_0 = Module["_emscripten_bind_b2GearJoint_GetJoint1_0"] = createExportWrapper("emscripten_bind_b2GearJoint_GetJoint1_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJoint_GetJoint2_0 = Module["_emscripten_bind_b2GearJoint_GetJoint2_0"] = createExportWrapper("emscripten_bind_b2GearJoint_GetJoint2_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJoint_SetRatio_1 = Module["_emscripten_bind_b2GearJoint_SetRatio_1"] = createExportWrapper("emscripten_bind_b2GearJoint_SetRatio_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJoint_GetRatio_0 = Module["_emscripten_bind_b2GearJoint_GetRatio_0"] = createExportWrapper("emscripten_bind_b2GearJoint_GetRatio_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJoint_GetType_0 = Module["_emscripten_bind_b2GearJoint_GetType_0"] = createExportWrapper("emscripten_bind_b2GearJoint_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJoint_GetBodyA_0 = Module["_emscripten_bind_b2GearJoint_GetBodyA_0"] = createExportWrapper("emscripten_bind_b2GearJoint_GetBodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJoint_GetBodyB_0 = Module["_emscripten_bind_b2GearJoint_GetBodyB_0"] = createExportWrapper("emscripten_bind_b2GearJoint_GetBodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJoint_GetAnchorA_0 = Module["_emscripten_bind_b2GearJoint_GetAnchorA_0"] = createExportWrapper("emscripten_bind_b2GearJoint_GetAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJoint_GetAnchorB_0 = Module["_emscripten_bind_b2GearJoint_GetAnchorB_0"] = createExportWrapper("emscripten_bind_b2GearJoint_GetAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJoint_GetReactionForce_1 = Module["_emscripten_bind_b2GearJoint_GetReactionForce_1"] = createExportWrapper("emscripten_bind_b2GearJoint_GetReactionForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJoint_GetReactionTorque_1 = Module["_emscripten_bind_b2GearJoint_GetReactionTorque_1"] = createExportWrapper("emscripten_bind_b2GearJoint_GetReactionTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJoint_GetNext_0 = Module["_emscripten_bind_b2GearJoint_GetNext_0"] = createExportWrapper("emscripten_bind_b2GearJoint_GetNext_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJoint_GetUserData_0 = Module["_emscripten_bind_b2GearJoint_GetUserData_0"] = createExportWrapper("emscripten_bind_b2GearJoint_GetUserData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJoint_GetCollideConnected_0 = Module["_emscripten_bind_b2GearJoint_GetCollideConnected_0"] = createExportWrapper("emscripten_bind_b2GearJoint_GetCollideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJoint___destroy___0 = Module["_emscripten_bind_b2GearJoint___destroy___0"] = createExportWrapper("emscripten_bind_b2GearJoint___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_b2GearJointDef_0 = Module["_emscripten_bind_b2GearJointDef_b2GearJointDef_0"] = createExportWrapper("emscripten_bind_b2GearJointDef_b2GearJointDef_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_get_joint1_0 = Module["_emscripten_bind_b2GearJointDef_get_joint1_0"] = createExportWrapper("emscripten_bind_b2GearJointDef_get_joint1_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_set_joint1_1 = Module["_emscripten_bind_b2GearJointDef_set_joint1_1"] = createExportWrapper("emscripten_bind_b2GearJointDef_set_joint1_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_get_joint2_0 = Module["_emscripten_bind_b2GearJointDef_get_joint2_0"] = createExportWrapper("emscripten_bind_b2GearJointDef_get_joint2_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_set_joint2_1 = Module["_emscripten_bind_b2GearJointDef_set_joint2_1"] = createExportWrapper("emscripten_bind_b2GearJointDef_set_joint2_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_get_ratio_0 = Module["_emscripten_bind_b2GearJointDef_get_ratio_0"] = createExportWrapper("emscripten_bind_b2GearJointDef_get_ratio_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_set_ratio_1 = Module["_emscripten_bind_b2GearJointDef_set_ratio_1"] = createExportWrapper("emscripten_bind_b2GearJointDef_set_ratio_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_get_type_0 = Module["_emscripten_bind_b2GearJointDef_get_type_0"] = createExportWrapper("emscripten_bind_b2GearJointDef_get_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_set_type_1 = Module["_emscripten_bind_b2GearJointDef_set_type_1"] = createExportWrapper("emscripten_bind_b2GearJointDef_set_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_get_userData_0 = Module["_emscripten_bind_b2GearJointDef_get_userData_0"] = createExportWrapper("emscripten_bind_b2GearJointDef_get_userData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_set_userData_1 = Module["_emscripten_bind_b2GearJointDef_set_userData_1"] = createExportWrapper("emscripten_bind_b2GearJointDef_set_userData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_get_bodyA_0 = Module["_emscripten_bind_b2GearJointDef_get_bodyA_0"] = createExportWrapper("emscripten_bind_b2GearJointDef_get_bodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_set_bodyA_1 = Module["_emscripten_bind_b2GearJointDef_set_bodyA_1"] = createExportWrapper("emscripten_bind_b2GearJointDef_set_bodyA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_get_bodyB_0 = Module["_emscripten_bind_b2GearJointDef_get_bodyB_0"] = createExportWrapper("emscripten_bind_b2GearJointDef_get_bodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_set_bodyB_1 = Module["_emscripten_bind_b2GearJointDef_set_bodyB_1"] = createExportWrapper("emscripten_bind_b2GearJointDef_set_bodyB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_get_collideConnected_0 = Module["_emscripten_bind_b2GearJointDef_get_collideConnected_0"] = createExportWrapper("emscripten_bind_b2GearJointDef_get_collideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef_set_collideConnected_1 = Module["_emscripten_bind_b2GearJointDef_set_collideConnected_1"] = createExportWrapper("emscripten_bind_b2GearJointDef_set_collideConnected_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2GearJointDef___destroy___0 = Module["_emscripten_bind_b2GearJointDef___destroy___0"] = createExportWrapper("emscripten_bind_b2GearJointDef___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointEdge_b2JointEdge_0 = Module["_emscripten_bind_b2JointEdge_b2JointEdge_0"] = createExportWrapper("emscripten_bind_b2JointEdge_b2JointEdge_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointEdge_get_other_0 = Module["_emscripten_bind_b2JointEdge_get_other_0"] = createExportWrapper("emscripten_bind_b2JointEdge_get_other_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointEdge_set_other_1 = Module["_emscripten_bind_b2JointEdge_set_other_1"] = createExportWrapper("emscripten_bind_b2JointEdge_set_other_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointEdge_get_joint_0 = Module["_emscripten_bind_b2JointEdge_get_joint_0"] = createExportWrapper("emscripten_bind_b2JointEdge_get_joint_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointEdge_set_joint_1 = Module["_emscripten_bind_b2JointEdge_set_joint_1"] = createExportWrapper("emscripten_bind_b2JointEdge_set_joint_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointEdge_get_prev_0 = Module["_emscripten_bind_b2JointEdge_get_prev_0"] = createExportWrapper("emscripten_bind_b2JointEdge_get_prev_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointEdge_set_prev_1 = Module["_emscripten_bind_b2JointEdge_set_prev_1"] = createExportWrapper("emscripten_bind_b2JointEdge_set_prev_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointEdge_get_next_0 = Module["_emscripten_bind_b2JointEdge_get_next_0"] = createExportWrapper("emscripten_bind_b2JointEdge_get_next_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointEdge_set_next_1 = Module["_emscripten_bind_b2JointEdge_set_next_1"] = createExportWrapper("emscripten_bind_b2JointEdge_set_next_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2JointEdge___destroy___0 = Module["_emscripten_bind_b2JointEdge___destroy___0"] = createExportWrapper("emscripten_bind_b2JointEdge___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Manifold_b2Manifold_0 = Module["_emscripten_bind_b2Manifold_b2Manifold_0"] = createExportWrapper("emscripten_bind_b2Manifold_b2Manifold_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Manifold_get_points_1 = Module["_emscripten_bind_b2Manifold_get_points_1"] = createExportWrapper("emscripten_bind_b2Manifold_get_points_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Manifold_set_points_2 = Module["_emscripten_bind_b2Manifold_set_points_2"] = createExportWrapper("emscripten_bind_b2Manifold_set_points_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2Manifold_get_localNormal_0 = Module["_emscripten_bind_b2Manifold_get_localNormal_0"] = createExportWrapper("emscripten_bind_b2Manifold_get_localNormal_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Manifold_set_localNormal_1 = Module["_emscripten_bind_b2Manifold_set_localNormal_1"] = createExportWrapper("emscripten_bind_b2Manifold_set_localNormal_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Manifold_get_localPoint_0 = Module["_emscripten_bind_b2Manifold_get_localPoint_0"] = createExportWrapper("emscripten_bind_b2Manifold_get_localPoint_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Manifold_set_localPoint_1 = Module["_emscripten_bind_b2Manifold_set_localPoint_1"] = createExportWrapper("emscripten_bind_b2Manifold_set_localPoint_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Manifold_get_type_0 = Module["_emscripten_bind_b2Manifold_get_type_0"] = createExportWrapper("emscripten_bind_b2Manifold_get_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Manifold_set_type_1 = Module["_emscripten_bind_b2Manifold_set_type_1"] = createExportWrapper("emscripten_bind_b2Manifold_set_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Manifold_get_pointCount_0 = Module["_emscripten_bind_b2Manifold_get_pointCount_0"] = createExportWrapper("emscripten_bind_b2Manifold_get_pointCount_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Manifold_set_pointCount_1 = Module["_emscripten_bind_b2Manifold_set_pointCount_1"] = createExportWrapper("emscripten_bind_b2Manifold_set_pointCount_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Manifold___destroy___0 = Module["_emscripten_bind_b2Manifold___destroy___0"] = createExportWrapper("emscripten_bind_b2Manifold___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WorldManifold_b2WorldManifold_0 = Module["_emscripten_bind_b2WorldManifold_b2WorldManifold_0"] = createExportWrapper("emscripten_bind_b2WorldManifold_b2WorldManifold_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WorldManifold_Initialize_5 = Module["_emscripten_bind_b2WorldManifold_Initialize_5"] = createExportWrapper("emscripten_bind_b2WorldManifold_Initialize_5");

/** @type {function(...*):?} */
var _emscripten_bind_b2WorldManifold_get_normal_0 = Module["_emscripten_bind_b2WorldManifold_get_normal_0"] = createExportWrapper("emscripten_bind_b2WorldManifold_get_normal_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WorldManifold_set_normal_1 = Module["_emscripten_bind_b2WorldManifold_set_normal_1"] = createExportWrapper("emscripten_bind_b2WorldManifold_set_normal_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WorldManifold_get_points_1 = Module["_emscripten_bind_b2WorldManifold_get_points_1"] = createExportWrapper("emscripten_bind_b2WorldManifold_get_points_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WorldManifold_set_points_2 = Module["_emscripten_bind_b2WorldManifold_set_points_2"] = createExportWrapper("emscripten_bind_b2WorldManifold_set_points_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2WorldManifold_get_separations_1 = Module["_emscripten_bind_b2WorldManifold_get_separations_1"] = createExportWrapper("emscripten_bind_b2WorldManifold_get_separations_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WorldManifold_set_separations_2 = Module["_emscripten_bind_b2WorldManifold_set_separations_2"] = createExportWrapper("emscripten_bind_b2WorldManifold_set_separations_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2WorldManifold___destroy___0 = Module["_emscripten_bind_b2WorldManifold___destroy___0"] = createExportWrapper("emscripten_bind_b2WorldManifold___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ManifoldPoint_b2ManifoldPoint_0 = Module["_emscripten_bind_b2ManifoldPoint_b2ManifoldPoint_0"] = createExportWrapper("emscripten_bind_b2ManifoldPoint_b2ManifoldPoint_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ManifoldPoint_get_localPoint_0 = Module["_emscripten_bind_b2ManifoldPoint_get_localPoint_0"] = createExportWrapper("emscripten_bind_b2ManifoldPoint_get_localPoint_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ManifoldPoint_set_localPoint_1 = Module["_emscripten_bind_b2ManifoldPoint_set_localPoint_1"] = createExportWrapper("emscripten_bind_b2ManifoldPoint_set_localPoint_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ManifoldPoint_get_normalImpulse_0 = Module["_emscripten_bind_b2ManifoldPoint_get_normalImpulse_0"] = createExportWrapper("emscripten_bind_b2ManifoldPoint_get_normalImpulse_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ManifoldPoint_set_normalImpulse_1 = Module["_emscripten_bind_b2ManifoldPoint_set_normalImpulse_1"] = createExportWrapper("emscripten_bind_b2ManifoldPoint_set_normalImpulse_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ManifoldPoint_get_tangentImpulse_0 = Module["_emscripten_bind_b2ManifoldPoint_get_tangentImpulse_0"] = createExportWrapper("emscripten_bind_b2ManifoldPoint_get_tangentImpulse_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ManifoldPoint_set_tangentImpulse_1 = Module["_emscripten_bind_b2ManifoldPoint_set_tangentImpulse_1"] = createExportWrapper("emscripten_bind_b2ManifoldPoint_set_tangentImpulse_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ManifoldPoint_get_id_0 = Module["_emscripten_bind_b2ManifoldPoint_get_id_0"] = createExportWrapper("emscripten_bind_b2ManifoldPoint_get_id_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ManifoldPoint_set_id_1 = Module["_emscripten_bind_b2ManifoldPoint_set_id_1"] = createExportWrapper("emscripten_bind_b2ManifoldPoint_set_id_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ManifoldPoint___destroy___0 = Module["_emscripten_bind_b2ManifoldPoint___destroy___0"] = createExportWrapper("emscripten_bind_b2ManifoldPoint___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat22_b2Mat22_0 = Module["_emscripten_bind_b2Mat22_b2Mat22_0"] = createExportWrapper("emscripten_bind_b2Mat22_b2Mat22_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat22_b2Mat22_2 = Module["_emscripten_bind_b2Mat22_b2Mat22_2"] = createExportWrapper("emscripten_bind_b2Mat22_b2Mat22_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat22_b2Mat22_4 = Module["_emscripten_bind_b2Mat22_b2Mat22_4"] = createExportWrapper("emscripten_bind_b2Mat22_b2Mat22_4");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat22_Set_2 = Module["_emscripten_bind_b2Mat22_Set_2"] = createExportWrapper("emscripten_bind_b2Mat22_Set_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat22_SetIdentity_0 = Module["_emscripten_bind_b2Mat22_SetIdentity_0"] = createExportWrapper("emscripten_bind_b2Mat22_SetIdentity_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat22_SetZero_0 = Module["_emscripten_bind_b2Mat22_SetZero_0"] = createExportWrapper("emscripten_bind_b2Mat22_SetZero_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat22_GetInverse_0 = Module["_emscripten_bind_b2Mat22_GetInverse_0"] = createExportWrapper("emscripten_bind_b2Mat22_GetInverse_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat22_Solve_1 = Module["_emscripten_bind_b2Mat22_Solve_1"] = createExportWrapper("emscripten_bind_b2Mat22_Solve_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat22_get_ex_0 = Module["_emscripten_bind_b2Mat22_get_ex_0"] = createExportWrapper("emscripten_bind_b2Mat22_get_ex_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat22_set_ex_1 = Module["_emscripten_bind_b2Mat22_set_ex_1"] = createExportWrapper("emscripten_bind_b2Mat22_set_ex_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat22_get_ey_0 = Module["_emscripten_bind_b2Mat22_get_ey_0"] = createExportWrapper("emscripten_bind_b2Mat22_get_ey_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat22_set_ey_1 = Module["_emscripten_bind_b2Mat22_set_ey_1"] = createExportWrapper("emscripten_bind_b2Mat22_set_ey_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat22___destroy___0 = Module["_emscripten_bind_b2Mat22___destroy___0"] = createExportWrapper("emscripten_bind_b2Mat22___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat33_b2Mat33_0 = Module["_emscripten_bind_b2Mat33_b2Mat33_0"] = createExportWrapper("emscripten_bind_b2Mat33_b2Mat33_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat33_b2Mat33_3 = Module["_emscripten_bind_b2Mat33_b2Mat33_3"] = createExportWrapper("emscripten_bind_b2Mat33_b2Mat33_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat33_SetZero_0 = Module["_emscripten_bind_b2Mat33_SetZero_0"] = createExportWrapper("emscripten_bind_b2Mat33_SetZero_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat33_Solve33_1 = Module["_emscripten_bind_b2Mat33_Solve33_1"] = createExportWrapper("emscripten_bind_b2Mat33_Solve33_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat33_Solve22_1 = Module["_emscripten_bind_b2Mat33_Solve22_1"] = createExportWrapper("emscripten_bind_b2Mat33_Solve22_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat33_GetInverse22_1 = Module["_emscripten_bind_b2Mat33_GetInverse22_1"] = createExportWrapper("emscripten_bind_b2Mat33_GetInverse22_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat33_GetSymInverse33_1 = Module["_emscripten_bind_b2Mat33_GetSymInverse33_1"] = createExportWrapper("emscripten_bind_b2Mat33_GetSymInverse33_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat33_get_ex_0 = Module["_emscripten_bind_b2Mat33_get_ex_0"] = createExportWrapper("emscripten_bind_b2Mat33_get_ex_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat33_set_ex_1 = Module["_emscripten_bind_b2Mat33_set_ex_1"] = createExportWrapper("emscripten_bind_b2Mat33_set_ex_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat33_get_ey_0 = Module["_emscripten_bind_b2Mat33_get_ey_0"] = createExportWrapper("emscripten_bind_b2Mat33_get_ey_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat33_set_ey_1 = Module["_emscripten_bind_b2Mat33_set_ey_1"] = createExportWrapper("emscripten_bind_b2Mat33_set_ey_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat33_get_ez_0 = Module["_emscripten_bind_b2Mat33_get_ez_0"] = createExportWrapper("emscripten_bind_b2Mat33_get_ez_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat33_set_ez_1 = Module["_emscripten_bind_b2Mat33_set_ez_1"] = createExportWrapper("emscripten_bind_b2Mat33_set_ez_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Mat33___destroy___0 = Module["_emscripten_bind_b2Mat33___destroy___0"] = createExportWrapper("emscripten_bind_b2Mat33___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_SetTarget_1 = Module["_emscripten_bind_b2MouseJoint_SetTarget_1"] = createExportWrapper("emscripten_bind_b2MouseJoint_SetTarget_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_GetTarget_0 = Module["_emscripten_bind_b2MouseJoint_GetTarget_0"] = createExportWrapper("emscripten_bind_b2MouseJoint_GetTarget_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_SetMaxForce_1 = Module["_emscripten_bind_b2MouseJoint_SetMaxForce_1"] = createExportWrapper("emscripten_bind_b2MouseJoint_SetMaxForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_GetMaxForce_0 = Module["_emscripten_bind_b2MouseJoint_GetMaxForce_0"] = createExportWrapper("emscripten_bind_b2MouseJoint_GetMaxForce_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_SetStiffness_1 = Module["_emscripten_bind_b2MouseJoint_SetStiffness_1"] = createExportWrapper("emscripten_bind_b2MouseJoint_SetStiffness_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_GetStiffness_0 = Module["_emscripten_bind_b2MouseJoint_GetStiffness_0"] = createExportWrapper("emscripten_bind_b2MouseJoint_GetStiffness_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_SetDamping_1 = Module["_emscripten_bind_b2MouseJoint_SetDamping_1"] = createExportWrapper("emscripten_bind_b2MouseJoint_SetDamping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_GetDamping_0 = Module["_emscripten_bind_b2MouseJoint_GetDamping_0"] = createExportWrapper("emscripten_bind_b2MouseJoint_GetDamping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_GetType_0 = Module["_emscripten_bind_b2MouseJoint_GetType_0"] = createExportWrapper("emscripten_bind_b2MouseJoint_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_GetBodyA_0 = Module["_emscripten_bind_b2MouseJoint_GetBodyA_0"] = createExportWrapper("emscripten_bind_b2MouseJoint_GetBodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_GetBodyB_0 = Module["_emscripten_bind_b2MouseJoint_GetBodyB_0"] = createExportWrapper("emscripten_bind_b2MouseJoint_GetBodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_GetAnchorA_0 = Module["_emscripten_bind_b2MouseJoint_GetAnchorA_0"] = createExportWrapper("emscripten_bind_b2MouseJoint_GetAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_GetAnchorB_0 = Module["_emscripten_bind_b2MouseJoint_GetAnchorB_0"] = createExportWrapper("emscripten_bind_b2MouseJoint_GetAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_GetReactionForce_1 = Module["_emscripten_bind_b2MouseJoint_GetReactionForce_1"] = createExportWrapper("emscripten_bind_b2MouseJoint_GetReactionForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_GetReactionTorque_1 = Module["_emscripten_bind_b2MouseJoint_GetReactionTorque_1"] = createExportWrapper("emscripten_bind_b2MouseJoint_GetReactionTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_GetNext_0 = Module["_emscripten_bind_b2MouseJoint_GetNext_0"] = createExportWrapper("emscripten_bind_b2MouseJoint_GetNext_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_GetUserData_0 = Module["_emscripten_bind_b2MouseJoint_GetUserData_0"] = createExportWrapper("emscripten_bind_b2MouseJoint_GetUserData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint_GetCollideConnected_0 = Module["_emscripten_bind_b2MouseJoint_GetCollideConnected_0"] = createExportWrapper("emscripten_bind_b2MouseJoint_GetCollideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJoint___destroy___0 = Module["_emscripten_bind_b2MouseJoint___destroy___0"] = createExportWrapper("emscripten_bind_b2MouseJoint___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_b2MouseJointDef_0 = Module["_emscripten_bind_b2MouseJointDef_b2MouseJointDef_0"] = createExportWrapper("emscripten_bind_b2MouseJointDef_b2MouseJointDef_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_get_target_0 = Module["_emscripten_bind_b2MouseJointDef_get_target_0"] = createExportWrapper("emscripten_bind_b2MouseJointDef_get_target_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_set_target_1 = Module["_emscripten_bind_b2MouseJointDef_set_target_1"] = createExportWrapper("emscripten_bind_b2MouseJointDef_set_target_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_get_maxForce_0 = Module["_emscripten_bind_b2MouseJointDef_get_maxForce_0"] = createExportWrapper("emscripten_bind_b2MouseJointDef_get_maxForce_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_set_maxForce_1 = Module["_emscripten_bind_b2MouseJointDef_set_maxForce_1"] = createExportWrapper("emscripten_bind_b2MouseJointDef_set_maxForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_get_stiffness_0 = Module["_emscripten_bind_b2MouseJointDef_get_stiffness_0"] = createExportWrapper("emscripten_bind_b2MouseJointDef_get_stiffness_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_set_stiffness_1 = Module["_emscripten_bind_b2MouseJointDef_set_stiffness_1"] = createExportWrapper("emscripten_bind_b2MouseJointDef_set_stiffness_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_get_damping_0 = Module["_emscripten_bind_b2MouseJointDef_get_damping_0"] = createExportWrapper("emscripten_bind_b2MouseJointDef_get_damping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_set_damping_1 = Module["_emscripten_bind_b2MouseJointDef_set_damping_1"] = createExportWrapper("emscripten_bind_b2MouseJointDef_set_damping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_get_type_0 = Module["_emscripten_bind_b2MouseJointDef_get_type_0"] = createExportWrapper("emscripten_bind_b2MouseJointDef_get_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_set_type_1 = Module["_emscripten_bind_b2MouseJointDef_set_type_1"] = createExportWrapper("emscripten_bind_b2MouseJointDef_set_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_get_userData_0 = Module["_emscripten_bind_b2MouseJointDef_get_userData_0"] = createExportWrapper("emscripten_bind_b2MouseJointDef_get_userData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_set_userData_1 = Module["_emscripten_bind_b2MouseJointDef_set_userData_1"] = createExportWrapper("emscripten_bind_b2MouseJointDef_set_userData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_get_bodyA_0 = Module["_emscripten_bind_b2MouseJointDef_get_bodyA_0"] = createExportWrapper("emscripten_bind_b2MouseJointDef_get_bodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_set_bodyA_1 = Module["_emscripten_bind_b2MouseJointDef_set_bodyA_1"] = createExportWrapper("emscripten_bind_b2MouseJointDef_set_bodyA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_get_bodyB_0 = Module["_emscripten_bind_b2MouseJointDef_get_bodyB_0"] = createExportWrapper("emscripten_bind_b2MouseJointDef_get_bodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_set_bodyB_1 = Module["_emscripten_bind_b2MouseJointDef_set_bodyB_1"] = createExportWrapper("emscripten_bind_b2MouseJointDef_set_bodyB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_get_collideConnected_0 = Module["_emscripten_bind_b2MouseJointDef_get_collideConnected_0"] = createExportWrapper("emscripten_bind_b2MouseJointDef_get_collideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef_set_collideConnected_1 = Module["_emscripten_bind_b2MouseJointDef_set_collideConnected_1"] = createExportWrapper("emscripten_bind_b2MouseJointDef_set_collideConnected_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MouseJointDef___destroy___0 = Module["_emscripten_bind_b2MouseJointDef___destroy___0"] = createExportWrapper("emscripten_bind_b2MouseJointDef___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_b2PolygonShape_0 = Module["_emscripten_bind_b2PolygonShape_b2PolygonShape_0"] = createExportWrapper("emscripten_bind_b2PolygonShape_b2PolygonShape_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_Set_2 = Module["_emscripten_bind_b2PolygonShape_Set_2"] = createExportWrapper("emscripten_bind_b2PolygonShape_Set_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_SetAsBox_2 = Module["_emscripten_bind_b2PolygonShape_SetAsBox_2"] = createExportWrapper("emscripten_bind_b2PolygonShape_SetAsBox_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_SetAsBox_4 = Module["_emscripten_bind_b2PolygonShape_SetAsBox_4"] = createExportWrapper("emscripten_bind_b2PolygonShape_SetAsBox_4");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_GetType_0 = Module["_emscripten_bind_b2PolygonShape_GetType_0"] = createExportWrapper("emscripten_bind_b2PolygonShape_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_GetChildCount_0 = Module["_emscripten_bind_b2PolygonShape_GetChildCount_0"] = createExportWrapper("emscripten_bind_b2PolygonShape_GetChildCount_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_TestPoint_2 = Module["_emscripten_bind_b2PolygonShape_TestPoint_2"] = createExportWrapper("emscripten_bind_b2PolygonShape_TestPoint_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_RayCast_4 = Module["_emscripten_bind_b2PolygonShape_RayCast_4"] = createExportWrapper("emscripten_bind_b2PolygonShape_RayCast_4");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_ComputeAABB_3 = Module["_emscripten_bind_b2PolygonShape_ComputeAABB_3"] = createExportWrapper("emscripten_bind_b2PolygonShape_ComputeAABB_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_ComputeMass_2 = Module["_emscripten_bind_b2PolygonShape_ComputeMass_2"] = createExportWrapper("emscripten_bind_b2PolygonShape_ComputeMass_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_get_m_centroid_0 = Module["_emscripten_bind_b2PolygonShape_get_m_centroid_0"] = createExportWrapper("emscripten_bind_b2PolygonShape_get_m_centroid_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_set_m_centroid_1 = Module["_emscripten_bind_b2PolygonShape_set_m_centroid_1"] = createExportWrapper("emscripten_bind_b2PolygonShape_set_m_centroid_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_get_m_vertices_1 = Module["_emscripten_bind_b2PolygonShape_get_m_vertices_1"] = createExportWrapper("emscripten_bind_b2PolygonShape_get_m_vertices_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_set_m_vertices_2 = Module["_emscripten_bind_b2PolygonShape_set_m_vertices_2"] = createExportWrapper("emscripten_bind_b2PolygonShape_set_m_vertices_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_get_m_normals_1 = Module["_emscripten_bind_b2PolygonShape_get_m_normals_1"] = createExportWrapper("emscripten_bind_b2PolygonShape_get_m_normals_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_set_m_normals_2 = Module["_emscripten_bind_b2PolygonShape_set_m_normals_2"] = createExportWrapper("emscripten_bind_b2PolygonShape_set_m_normals_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_get_m_count_0 = Module["_emscripten_bind_b2PolygonShape_get_m_count_0"] = createExportWrapper("emscripten_bind_b2PolygonShape_get_m_count_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_set_m_count_1 = Module["_emscripten_bind_b2PolygonShape_set_m_count_1"] = createExportWrapper("emscripten_bind_b2PolygonShape_set_m_count_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_get_m_type_0 = Module["_emscripten_bind_b2PolygonShape_get_m_type_0"] = createExportWrapper("emscripten_bind_b2PolygonShape_get_m_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_set_m_type_1 = Module["_emscripten_bind_b2PolygonShape_set_m_type_1"] = createExportWrapper("emscripten_bind_b2PolygonShape_set_m_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_get_m_radius_0 = Module["_emscripten_bind_b2PolygonShape_get_m_radius_0"] = createExportWrapper("emscripten_bind_b2PolygonShape_get_m_radius_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape_set_m_radius_1 = Module["_emscripten_bind_b2PolygonShape_set_m_radius_1"] = createExportWrapper("emscripten_bind_b2PolygonShape_set_m_radius_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PolygonShape___destroy___0 = Module["_emscripten_bind_b2PolygonShape___destroy___0"] = createExportWrapper("emscripten_bind_b2PolygonShape___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetLocalAnchorA_0 = Module["_emscripten_bind_b2PrismaticJoint_GetLocalAnchorA_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetLocalAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetLocalAnchorB_0 = Module["_emscripten_bind_b2PrismaticJoint_GetLocalAnchorB_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetLocalAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetLocalAxisA_0 = Module["_emscripten_bind_b2PrismaticJoint_GetLocalAxisA_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetLocalAxisA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetReferenceAngle_0 = Module["_emscripten_bind_b2PrismaticJoint_GetReferenceAngle_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetReferenceAngle_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetJointTranslation_0 = Module["_emscripten_bind_b2PrismaticJoint_GetJointTranslation_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetJointTranslation_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetJointSpeed_0 = Module["_emscripten_bind_b2PrismaticJoint_GetJointSpeed_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetJointSpeed_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_IsLimitEnabled_0 = Module["_emscripten_bind_b2PrismaticJoint_IsLimitEnabled_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_IsLimitEnabled_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_EnableLimit_1 = Module["_emscripten_bind_b2PrismaticJoint_EnableLimit_1"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_EnableLimit_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetLowerLimit_0 = Module["_emscripten_bind_b2PrismaticJoint_GetLowerLimit_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetLowerLimit_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetUpperLimit_0 = Module["_emscripten_bind_b2PrismaticJoint_GetUpperLimit_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetUpperLimit_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_SetLimits_2 = Module["_emscripten_bind_b2PrismaticJoint_SetLimits_2"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_SetLimits_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_IsMotorEnabled_0 = Module["_emscripten_bind_b2PrismaticJoint_IsMotorEnabled_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_IsMotorEnabled_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_EnableMotor_1 = Module["_emscripten_bind_b2PrismaticJoint_EnableMotor_1"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_EnableMotor_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_SetMotorSpeed_1 = Module["_emscripten_bind_b2PrismaticJoint_SetMotorSpeed_1"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_SetMotorSpeed_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetMotorSpeed_0 = Module["_emscripten_bind_b2PrismaticJoint_GetMotorSpeed_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetMotorSpeed_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_SetMaxMotorForce_1 = Module["_emscripten_bind_b2PrismaticJoint_SetMaxMotorForce_1"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_SetMaxMotorForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetMaxMotorForce_0 = Module["_emscripten_bind_b2PrismaticJoint_GetMaxMotorForce_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetMaxMotorForce_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetMotorForce_1 = Module["_emscripten_bind_b2PrismaticJoint_GetMotorForce_1"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetMotorForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetType_0 = Module["_emscripten_bind_b2PrismaticJoint_GetType_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetBodyA_0 = Module["_emscripten_bind_b2PrismaticJoint_GetBodyA_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetBodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetBodyB_0 = Module["_emscripten_bind_b2PrismaticJoint_GetBodyB_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetBodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetAnchorA_0 = Module["_emscripten_bind_b2PrismaticJoint_GetAnchorA_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetAnchorB_0 = Module["_emscripten_bind_b2PrismaticJoint_GetAnchorB_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetReactionForce_1 = Module["_emscripten_bind_b2PrismaticJoint_GetReactionForce_1"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetReactionForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetReactionTorque_1 = Module["_emscripten_bind_b2PrismaticJoint_GetReactionTorque_1"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetReactionTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetNext_0 = Module["_emscripten_bind_b2PrismaticJoint_GetNext_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetNext_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetUserData_0 = Module["_emscripten_bind_b2PrismaticJoint_GetUserData_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetUserData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint_GetCollideConnected_0 = Module["_emscripten_bind_b2PrismaticJoint_GetCollideConnected_0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint_GetCollideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJoint___destroy___0 = Module["_emscripten_bind_b2PrismaticJoint___destroy___0"] = createExportWrapper("emscripten_bind_b2PrismaticJoint___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_b2PrismaticJointDef_0 = Module["_emscripten_bind_b2PrismaticJointDef_b2PrismaticJointDef_0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_b2PrismaticJointDef_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_Initialize_4 = Module["_emscripten_bind_b2PrismaticJointDef_Initialize_4"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_Initialize_4");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_get_localAnchorA_0 = Module["_emscripten_bind_b2PrismaticJointDef_get_localAnchorA_0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_get_localAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_set_localAnchorA_1 = Module["_emscripten_bind_b2PrismaticJointDef_set_localAnchorA_1"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_set_localAnchorA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_get_localAnchorB_0 = Module["_emscripten_bind_b2PrismaticJointDef_get_localAnchorB_0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_get_localAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_set_localAnchorB_1 = Module["_emscripten_bind_b2PrismaticJointDef_set_localAnchorB_1"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_set_localAnchorB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_get_localAxisA_0 = Module["_emscripten_bind_b2PrismaticJointDef_get_localAxisA_0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_get_localAxisA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_set_localAxisA_1 = Module["_emscripten_bind_b2PrismaticJointDef_set_localAxisA_1"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_set_localAxisA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_get_referenceAngle_0 = Module["_emscripten_bind_b2PrismaticJointDef_get_referenceAngle_0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_get_referenceAngle_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_set_referenceAngle_1 = Module["_emscripten_bind_b2PrismaticJointDef_set_referenceAngle_1"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_set_referenceAngle_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_get_enableLimit_0 = Module["_emscripten_bind_b2PrismaticJointDef_get_enableLimit_0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_get_enableLimit_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_set_enableLimit_1 = Module["_emscripten_bind_b2PrismaticJointDef_set_enableLimit_1"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_set_enableLimit_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_get_lowerTranslation_0 = Module["_emscripten_bind_b2PrismaticJointDef_get_lowerTranslation_0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_get_lowerTranslation_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_set_lowerTranslation_1 = Module["_emscripten_bind_b2PrismaticJointDef_set_lowerTranslation_1"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_set_lowerTranslation_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_get_upperTranslation_0 = Module["_emscripten_bind_b2PrismaticJointDef_get_upperTranslation_0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_get_upperTranslation_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_set_upperTranslation_1 = Module["_emscripten_bind_b2PrismaticJointDef_set_upperTranslation_1"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_set_upperTranslation_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_get_enableMotor_0 = Module["_emscripten_bind_b2PrismaticJointDef_get_enableMotor_0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_get_enableMotor_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_set_enableMotor_1 = Module["_emscripten_bind_b2PrismaticJointDef_set_enableMotor_1"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_set_enableMotor_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_get_maxMotorForce_0 = Module["_emscripten_bind_b2PrismaticJointDef_get_maxMotorForce_0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_get_maxMotorForce_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_set_maxMotorForce_1 = Module["_emscripten_bind_b2PrismaticJointDef_set_maxMotorForce_1"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_set_maxMotorForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_get_motorSpeed_0 = Module["_emscripten_bind_b2PrismaticJointDef_get_motorSpeed_0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_get_motorSpeed_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_set_motorSpeed_1 = Module["_emscripten_bind_b2PrismaticJointDef_set_motorSpeed_1"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_set_motorSpeed_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_get_type_0 = Module["_emscripten_bind_b2PrismaticJointDef_get_type_0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_get_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_set_type_1 = Module["_emscripten_bind_b2PrismaticJointDef_set_type_1"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_set_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_get_userData_0 = Module["_emscripten_bind_b2PrismaticJointDef_get_userData_0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_get_userData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_set_userData_1 = Module["_emscripten_bind_b2PrismaticJointDef_set_userData_1"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_set_userData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_get_bodyA_0 = Module["_emscripten_bind_b2PrismaticJointDef_get_bodyA_0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_get_bodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_set_bodyA_1 = Module["_emscripten_bind_b2PrismaticJointDef_set_bodyA_1"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_set_bodyA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_get_bodyB_0 = Module["_emscripten_bind_b2PrismaticJointDef_get_bodyB_0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_get_bodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_set_bodyB_1 = Module["_emscripten_bind_b2PrismaticJointDef_set_bodyB_1"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_set_bodyB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_get_collideConnected_0 = Module["_emscripten_bind_b2PrismaticJointDef_get_collideConnected_0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_get_collideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef_set_collideConnected_1 = Module["_emscripten_bind_b2PrismaticJointDef_set_collideConnected_1"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef_set_collideConnected_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PrismaticJointDef___destroy___0 = Module["_emscripten_bind_b2PrismaticJointDef___destroy___0"] = createExportWrapper("emscripten_bind_b2PrismaticJointDef___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile_get_step_0 = Module["_emscripten_bind_b2Profile_get_step_0"] = createExportWrapper("emscripten_bind_b2Profile_get_step_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile_set_step_1 = Module["_emscripten_bind_b2Profile_set_step_1"] = createExportWrapper("emscripten_bind_b2Profile_set_step_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile_get_collide_0 = Module["_emscripten_bind_b2Profile_get_collide_0"] = createExportWrapper("emscripten_bind_b2Profile_get_collide_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile_set_collide_1 = Module["_emscripten_bind_b2Profile_set_collide_1"] = createExportWrapper("emscripten_bind_b2Profile_set_collide_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile_get_solve_0 = Module["_emscripten_bind_b2Profile_get_solve_0"] = createExportWrapper("emscripten_bind_b2Profile_get_solve_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile_set_solve_1 = Module["_emscripten_bind_b2Profile_set_solve_1"] = createExportWrapper("emscripten_bind_b2Profile_set_solve_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile_get_solveInit_0 = Module["_emscripten_bind_b2Profile_get_solveInit_0"] = createExportWrapper("emscripten_bind_b2Profile_get_solveInit_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile_set_solveInit_1 = Module["_emscripten_bind_b2Profile_set_solveInit_1"] = createExportWrapper("emscripten_bind_b2Profile_set_solveInit_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile_get_solveVelocity_0 = Module["_emscripten_bind_b2Profile_get_solveVelocity_0"] = createExportWrapper("emscripten_bind_b2Profile_get_solveVelocity_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile_set_solveVelocity_1 = Module["_emscripten_bind_b2Profile_set_solveVelocity_1"] = createExportWrapper("emscripten_bind_b2Profile_set_solveVelocity_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile_get_solvePosition_0 = Module["_emscripten_bind_b2Profile_get_solvePosition_0"] = createExportWrapper("emscripten_bind_b2Profile_get_solvePosition_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile_set_solvePosition_1 = Module["_emscripten_bind_b2Profile_set_solvePosition_1"] = createExportWrapper("emscripten_bind_b2Profile_set_solvePosition_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile_get_broadphase_0 = Module["_emscripten_bind_b2Profile_get_broadphase_0"] = createExportWrapper("emscripten_bind_b2Profile_get_broadphase_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile_set_broadphase_1 = Module["_emscripten_bind_b2Profile_set_broadphase_1"] = createExportWrapper("emscripten_bind_b2Profile_set_broadphase_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile_get_solveTOI_0 = Module["_emscripten_bind_b2Profile_get_solveTOI_0"] = createExportWrapper("emscripten_bind_b2Profile_get_solveTOI_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile_set_solveTOI_1 = Module["_emscripten_bind_b2Profile_set_solveTOI_1"] = createExportWrapper("emscripten_bind_b2Profile_set_solveTOI_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Profile___destroy___0 = Module["_emscripten_bind_b2Profile___destroy___0"] = createExportWrapper("emscripten_bind_b2Profile___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetGroundAnchorA_0 = Module["_emscripten_bind_b2PulleyJoint_GetGroundAnchorA_0"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetGroundAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetGroundAnchorB_0 = Module["_emscripten_bind_b2PulleyJoint_GetGroundAnchorB_0"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetGroundAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetLengthA_0 = Module["_emscripten_bind_b2PulleyJoint_GetLengthA_0"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetLengthA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetLengthB_0 = Module["_emscripten_bind_b2PulleyJoint_GetLengthB_0"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetLengthB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetRatio_0 = Module["_emscripten_bind_b2PulleyJoint_GetRatio_0"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetRatio_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetCurrentLengthA_0 = Module["_emscripten_bind_b2PulleyJoint_GetCurrentLengthA_0"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetCurrentLengthA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetCurrentLengthB_0 = Module["_emscripten_bind_b2PulleyJoint_GetCurrentLengthB_0"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetCurrentLengthB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetType_0 = Module["_emscripten_bind_b2PulleyJoint_GetType_0"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetBodyA_0 = Module["_emscripten_bind_b2PulleyJoint_GetBodyA_0"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetBodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetBodyB_0 = Module["_emscripten_bind_b2PulleyJoint_GetBodyB_0"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetBodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetAnchorA_0 = Module["_emscripten_bind_b2PulleyJoint_GetAnchorA_0"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetAnchorB_0 = Module["_emscripten_bind_b2PulleyJoint_GetAnchorB_0"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetReactionForce_1 = Module["_emscripten_bind_b2PulleyJoint_GetReactionForce_1"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetReactionForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetReactionTorque_1 = Module["_emscripten_bind_b2PulleyJoint_GetReactionTorque_1"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetReactionTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetNext_0 = Module["_emscripten_bind_b2PulleyJoint_GetNext_0"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetNext_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetUserData_0 = Module["_emscripten_bind_b2PulleyJoint_GetUserData_0"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetUserData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint_GetCollideConnected_0 = Module["_emscripten_bind_b2PulleyJoint_GetCollideConnected_0"] = createExportWrapper("emscripten_bind_b2PulleyJoint_GetCollideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJoint___destroy___0 = Module["_emscripten_bind_b2PulleyJoint___destroy___0"] = createExportWrapper("emscripten_bind_b2PulleyJoint___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_b2PulleyJointDef_0 = Module["_emscripten_bind_b2PulleyJointDef_b2PulleyJointDef_0"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_b2PulleyJointDef_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_Initialize_7 = Module["_emscripten_bind_b2PulleyJointDef_Initialize_7"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_Initialize_7");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_get_groundAnchorA_0 = Module["_emscripten_bind_b2PulleyJointDef_get_groundAnchorA_0"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_get_groundAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_set_groundAnchorA_1 = Module["_emscripten_bind_b2PulleyJointDef_set_groundAnchorA_1"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_set_groundAnchorA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_get_groundAnchorB_0 = Module["_emscripten_bind_b2PulleyJointDef_get_groundAnchorB_0"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_get_groundAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_set_groundAnchorB_1 = Module["_emscripten_bind_b2PulleyJointDef_set_groundAnchorB_1"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_set_groundAnchorB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_get_localAnchorA_0 = Module["_emscripten_bind_b2PulleyJointDef_get_localAnchorA_0"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_get_localAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_set_localAnchorA_1 = Module["_emscripten_bind_b2PulleyJointDef_set_localAnchorA_1"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_set_localAnchorA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_get_localAnchorB_0 = Module["_emscripten_bind_b2PulleyJointDef_get_localAnchorB_0"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_get_localAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_set_localAnchorB_1 = Module["_emscripten_bind_b2PulleyJointDef_set_localAnchorB_1"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_set_localAnchorB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_get_lengthA_0 = Module["_emscripten_bind_b2PulleyJointDef_get_lengthA_0"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_get_lengthA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_set_lengthA_1 = Module["_emscripten_bind_b2PulleyJointDef_set_lengthA_1"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_set_lengthA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_get_lengthB_0 = Module["_emscripten_bind_b2PulleyJointDef_get_lengthB_0"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_get_lengthB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_set_lengthB_1 = Module["_emscripten_bind_b2PulleyJointDef_set_lengthB_1"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_set_lengthB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_get_ratio_0 = Module["_emscripten_bind_b2PulleyJointDef_get_ratio_0"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_get_ratio_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_set_ratio_1 = Module["_emscripten_bind_b2PulleyJointDef_set_ratio_1"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_set_ratio_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_get_type_0 = Module["_emscripten_bind_b2PulleyJointDef_get_type_0"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_get_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_set_type_1 = Module["_emscripten_bind_b2PulleyJointDef_set_type_1"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_set_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_get_userData_0 = Module["_emscripten_bind_b2PulleyJointDef_get_userData_0"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_get_userData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_set_userData_1 = Module["_emscripten_bind_b2PulleyJointDef_set_userData_1"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_set_userData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_get_bodyA_0 = Module["_emscripten_bind_b2PulleyJointDef_get_bodyA_0"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_get_bodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_set_bodyA_1 = Module["_emscripten_bind_b2PulleyJointDef_set_bodyA_1"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_set_bodyA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_get_bodyB_0 = Module["_emscripten_bind_b2PulleyJointDef_get_bodyB_0"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_get_bodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_set_bodyB_1 = Module["_emscripten_bind_b2PulleyJointDef_set_bodyB_1"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_set_bodyB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_get_collideConnected_0 = Module["_emscripten_bind_b2PulleyJointDef_get_collideConnected_0"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_get_collideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef_set_collideConnected_1 = Module["_emscripten_bind_b2PulleyJointDef_set_collideConnected_1"] = createExportWrapper("emscripten_bind_b2PulleyJointDef_set_collideConnected_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2PulleyJointDef___destroy___0 = Module["_emscripten_bind_b2PulleyJointDef___destroy___0"] = createExportWrapper("emscripten_bind_b2PulleyJointDef___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RayCastInput_get_p1_0 = Module["_emscripten_bind_b2RayCastInput_get_p1_0"] = createExportWrapper("emscripten_bind_b2RayCastInput_get_p1_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RayCastInput_set_p1_1 = Module["_emscripten_bind_b2RayCastInput_set_p1_1"] = createExportWrapper("emscripten_bind_b2RayCastInput_set_p1_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RayCastInput_get_p2_0 = Module["_emscripten_bind_b2RayCastInput_get_p2_0"] = createExportWrapper("emscripten_bind_b2RayCastInput_get_p2_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RayCastInput_set_p2_1 = Module["_emscripten_bind_b2RayCastInput_set_p2_1"] = createExportWrapper("emscripten_bind_b2RayCastInput_set_p2_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RayCastInput_get_maxFraction_0 = Module["_emscripten_bind_b2RayCastInput_get_maxFraction_0"] = createExportWrapper("emscripten_bind_b2RayCastInput_get_maxFraction_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RayCastInput_set_maxFraction_1 = Module["_emscripten_bind_b2RayCastInput_set_maxFraction_1"] = createExportWrapper("emscripten_bind_b2RayCastInput_set_maxFraction_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RayCastInput___destroy___0 = Module["_emscripten_bind_b2RayCastInput___destroy___0"] = createExportWrapper("emscripten_bind_b2RayCastInput___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RayCastOutput_get_normal_0 = Module["_emscripten_bind_b2RayCastOutput_get_normal_0"] = createExportWrapper("emscripten_bind_b2RayCastOutput_get_normal_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RayCastOutput_set_normal_1 = Module["_emscripten_bind_b2RayCastOutput_set_normal_1"] = createExportWrapper("emscripten_bind_b2RayCastOutput_set_normal_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RayCastOutput_get_fraction_0 = Module["_emscripten_bind_b2RayCastOutput_get_fraction_0"] = createExportWrapper("emscripten_bind_b2RayCastOutput_get_fraction_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RayCastOutput_set_fraction_1 = Module["_emscripten_bind_b2RayCastOutput_set_fraction_1"] = createExportWrapper("emscripten_bind_b2RayCastOutput_set_fraction_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RayCastOutput___destroy___0 = Module["_emscripten_bind_b2RayCastOutput___destroy___0"] = createExportWrapper("emscripten_bind_b2RayCastOutput___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetLocalAnchorA_0 = Module["_emscripten_bind_b2RevoluteJoint_GetLocalAnchorA_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetLocalAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetLocalAnchorB_0 = Module["_emscripten_bind_b2RevoluteJoint_GetLocalAnchorB_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetLocalAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetReferenceAngle_0 = Module["_emscripten_bind_b2RevoluteJoint_GetReferenceAngle_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetReferenceAngle_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetJointAngle_0 = Module["_emscripten_bind_b2RevoluteJoint_GetJointAngle_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetJointAngle_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetJointSpeed_0 = Module["_emscripten_bind_b2RevoluteJoint_GetJointSpeed_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetJointSpeed_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_IsLimitEnabled_0 = Module["_emscripten_bind_b2RevoluteJoint_IsLimitEnabled_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_IsLimitEnabled_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_EnableLimit_1 = Module["_emscripten_bind_b2RevoluteJoint_EnableLimit_1"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_EnableLimit_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetLowerLimit_0 = Module["_emscripten_bind_b2RevoluteJoint_GetLowerLimit_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetLowerLimit_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetUpperLimit_0 = Module["_emscripten_bind_b2RevoluteJoint_GetUpperLimit_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetUpperLimit_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_SetLimits_2 = Module["_emscripten_bind_b2RevoluteJoint_SetLimits_2"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_SetLimits_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_IsMotorEnabled_0 = Module["_emscripten_bind_b2RevoluteJoint_IsMotorEnabled_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_IsMotorEnabled_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_EnableMotor_1 = Module["_emscripten_bind_b2RevoluteJoint_EnableMotor_1"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_EnableMotor_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_SetMotorSpeed_1 = Module["_emscripten_bind_b2RevoluteJoint_SetMotorSpeed_1"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_SetMotorSpeed_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetMotorSpeed_0 = Module["_emscripten_bind_b2RevoluteJoint_GetMotorSpeed_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetMotorSpeed_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_SetMaxMotorTorque_1 = Module["_emscripten_bind_b2RevoluteJoint_SetMaxMotorTorque_1"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_SetMaxMotorTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetMaxMotorTorque_0 = Module["_emscripten_bind_b2RevoluteJoint_GetMaxMotorTorque_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetMaxMotorTorque_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetMotorTorque_1 = Module["_emscripten_bind_b2RevoluteJoint_GetMotorTorque_1"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetMotorTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetType_0 = Module["_emscripten_bind_b2RevoluteJoint_GetType_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetBodyA_0 = Module["_emscripten_bind_b2RevoluteJoint_GetBodyA_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetBodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetBodyB_0 = Module["_emscripten_bind_b2RevoluteJoint_GetBodyB_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetBodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetAnchorA_0 = Module["_emscripten_bind_b2RevoluteJoint_GetAnchorA_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetAnchorB_0 = Module["_emscripten_bind_b2RevoluteJoint_GetAnchorB_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetReactionForce_1 = Module["_emscripten_bind_b2RevoluteJoint_GetReactionForce_1"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetReactionForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetReactionTorque_1 = Module["_emscripten_bind_b2RevoluteJoint_GetReactionTorque_1"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetReactionTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetNext_0 = Module["_emscripten_bind_b2RevoluteJoint_GetNext_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetNext_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetUserData_0 = Module["_emscripten_bind_b2RevoluteJoint_GetUserData_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetUserData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint_GetCollideConnected_0 = Module["_emscripten_bind_b2RevoluteJoint_GetCollideConnected_0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint_GetCollideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJoint___destroy___0 = Module["_emscripten_bind_b2RevoluteJoint___destroy___0"] = createExportWrapper("emscripten_bind_b2RevoluteJoint___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_b2RevoluteJointDef_0 = Module["_emscripten_bind_b2RevoluteJointDef_b2RevoluteJointDef_0"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_b2RevoluteJointDef_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_Initialize_3 = Module["_emscripten_bind_b2RevoluteJointDef_Initialize_3"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_Initialize_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_get_localAnchorA_0 = Module["_emscripten_bind_b2RevoluteJointDef_get_localAnchorA_0"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_get_localAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_set_localAnchorA_1 = Module["_emscripten_bind_b2RevoluteJointDef_set_localAnchorA_1"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_set_localAnchorA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_get_localAnchorB_0 = Module["_emscripten_bind_b2RevoluteJointDef_get_localAnchorB_0"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_get_localAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_set_localAnchorB_1 = Module["_emscripten_bind_b2RevoluteJointDef_set_localAnchorB_1"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_set_localAnchorB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_get_referenceAngle_0 = Module["_emscripten_bind_b2RevoluteJointDef_get_referenceAngle_0"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_get_referenceAngle_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_set_referenceAngle_1 = Module["_emscripten_bind_b2RevoluteJointDef_set_referenceAngle_1"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_set_referenceAngle_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_get_enableLimit_0 = Module["_emscripten_bind_b2RevoluteJointDef_get_enableLimit_0"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_get_enableLimit_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_set_enableLimit_1 = Module["_emscripten_bind_b2RevoluteJointDef_set_enableLimit_1"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_set_enableLimit_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_get_lowerAngle_0 = Module["_emscripten_bind_b2RevoluteJointDef_get_lowerAngle_0"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_get_lowerAngle_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_set_lowerAngle_1 = Module["_emscripten_bind_b2RevoluteJointDef_set_lowerAngle_1"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_set_lowerAngle_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_get_upperAngle_0 = Module["_emscripten_bind_b2RevoluteJointDef_get_upperAngle_0"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_get_upperAngle_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_set_upperAngle_1 = Module["_emscripten_bind_b2RevoluteJointDef_set_upperAngle_1"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_set_upperAngle_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_get_enableMotor_0 = Module["_emscripten_bind_b2RevoluteJointDef_get_enableMotor_0"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_get_enableMotor_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_set_enableMotor_1 = Module["_emscripten_bind_b2RevoluteJointDef_set_enableMotor_1"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_set_enableMotor_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_get_motorSpeed_0 = Module["_emscripten_bind_b2RevoluteJointDef_get_motorSpeed_0"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_get_motorSpeed_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_set_motorSpeed_1 = Module["_emscripten_bind_b2RevoluteJointDef_set_motorSpeed_1"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_set_motorSpeed_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_get_maxMotorTorque_0 = Module["_emscripten_bind_b2RevoluteJointDef_get_maxMotorTorque_0"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_get_maxMotorTorque_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_set_maxMotorTorque_1 = Module["_emscripten_bind_b2RevoluteJointDef_set_maxMotorTorque_1"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_set_maxMotorTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_get_type_0 = Module["_emscripten_bind_b2RevoluteJointDef_get_type_0"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_get_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_set_type_1 = Module["_emscripten_bind_b2RevoluteJointDef_set_type_1"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_set_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_get_userData_0 = Module["_emscripten_bind_b2RevoluteJointDef_get_userData_0"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_get_userData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_set_userData_1 = Module["_emscripten_bind_b2RevoluteJointDef_set_userData_1"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_set_userData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_get_bodyA_0 = Module["_emscripten_bind_b2RevoluteJointDef_get_bodyA_0"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_get_bodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_set_bodyA_1 = Module["_emscripten_bind_b2RevoluteJointDef_set_bodyA_1"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_set_bodyA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_get_bodyB_0 = Module["_emscripten_bind_b2RevoluteJointDef_get_bodyB_0"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_get_bodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_set_bodyB_1 = Module["_emscripten_bind_b2RevoluteJointDef_set_bodyB_1"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_set_bodyB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_get_collideConnected_0 = Module["_emscripten_bind_b2RevoluteJointDef_get_collideConnected_0"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_get_collideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef_set_collideConnected_1 = Module["_emscripten_bind_b2RevoluteJointDef_set_collideConnected_1"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef_set_collideConnected_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RevoluteJointDef___destroy___0 = Module["_emscripten_bind_b2RevoluteJointDef___destroy___0"] = createExportWrapper("emscripten_bind_b2RevoluteJointDef___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rot_b2Rot_0 = Module["_emscripten_bind_b2Rot_b2Rot_0"] = createExportWrapper("emscripten_bind_b2Rot_b2Rot_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rot_b2Rot_1 = Module["_emscripten_bind_b2Rot_b2Rot_1"] = createExportWrapper("emscripten_bind_b2Rot_b2Rot_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rot_Set_1 = Module["_emscripten_bind_b2Rot_Set_1"] = createExportWrapper("emscripten_bind_b2Rot_Set_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rot_SetIdentity_0 = Module["_emscripten_bind_b2Rot_SetIdentity_0"] = createExportWrapper("emscripten_bind_b2Rot_SetIdentity_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rot_GetAngle_0 = Module["_emscripten_bind_b2Rot_GetAngle_0"] = createExportWrapper("emscripten_bind_b2Rot_GetAngle_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rot_GetXAxis_0 = Module["_emscripten_bind_b2Rot_GetXAxis_0"] = createExportWrapper("emscripten_bind_b2Rot_GetXAxis_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rot_GetYAxis_0 = Module["_emscripten_bind_b2Rot_GetYAxis_0"] = createExportWrapper("emscripten_bind_b2Rot_GetYAxis_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rot_get_s_0 = Module["_emscripten_bind_b2Rot_get_s_0"] = createExportWrapper("emscripten_bind_b2Rot_get_s_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rot_set_s_1 = Module["_emscripten_bind_b2Rot_set_s_1"] = createExportWrapper("emscripten_bind_b2Rot_set_s_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rot_get_c_0 = Module["_emscripten_bind_b2Rot_get_c_0"] = createExportWrapper("emscripten_bind_b2Rot_get_c_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rot_set_c_1 = Module["_emscripten_bind_b2Rot_set_c_1"] = createExportWrapper("emscripten_bind_b2Rot_set_c_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rot___destroy___0 = Module["_emscripten_bind_b2Rot___destroy___0"] = createExportWrapper("emscripten_bind_b2Rot___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetLocalAnchorA_0 = Module["_emscripten_bind_b2WheelJoint_GetLocalAnchorA_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetLocalAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetLocalAnchorB_0 = Module["_emscripten_bind_b2WheelJoint_GetLocalAnchorB_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetLocalAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetLocalAxisA_0 = Module["_emscripten_bind_b2WheelJoint_GetLocalAxisA_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetLocalAxisA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetJointTranslation_0 = Module["_emscripten_bind_b2WheelJoint_GetJointTranslation_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetJointTranslation_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetJointLinearSpeed_0 = Module["_emscripten_bind_b2WheelJoint_GetJointLinearSpeed_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetJointLinearSpeed_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetJointAngle_0 = Module["_emscripten_bind_b2WheelJoint_GetJointAngle_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetJointAngle_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetJointAngularSpeed_0 = Module["_emscripten_bind_b2WheelJoint_GetJointAngularSpeed_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetJointAngularSpeed_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_IsLimitEnabled_0 = Module["_emscripten_bind_b2WheelJoint_IsLimitEnabled_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_IsLimitEnabled_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_EnableLimit_1 = Module["_emscripten_bind_b2WheelJoint_EnableLimit_1"] = createExportWrapper("emscripten_bind_b2WheelJoint_EnableLimit_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetLowerLimit_0 = Module["_emscripten_bind_b2WheelJoint_GetLowerLimit_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetLowerLimit_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetUpperLimit_0 = Module["_emscripten_bind_b2WheelJoint_GetUpperLimit_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetUpperLimit_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_SetLimits_2 = Module["_emscripten_bind_b2WheelJoint_SetLimits_2"] = createExportWrapper("emscripten_bind_b2WheelJoint_SetLimits_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_IsMotorEnabled_0 = Module["_emscripten_bind_b2WheelJoint_IsMotorEnabled_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_IsMotorEnabled_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_EnableMotor_1 = Module["_emscripten_bind_b2WheelJoint_EnableMotor_1"] = createExportWrapper("emscripten_bind_b2WheelJoint_EnableMotor_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_SetMotorSpeed_1 = Module["_emscripten_bind_b2WheelJoint_SetMotorSpeed_1"] = createExportWrapper("emscripten_bind_b2WheelJoint_SetMotorSpeed_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetMotorSpeed_0 = Module["_emscripten_bind_b2WheelJoint_GetMotorSpeed_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetMotorSpeed_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_SetMaxMotorTorque_1 = Module["_emscripten_bind_b2WheelJoint_SetMaxMotorTorque_1"] = createExportWrapper("emscripten_bind_b2WheelJoint_SetMaxMotorTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetMaxMotorTorque_0 = Module["_emscripten_bind_b2WheelJoint_GetMaxMotorTorque_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetMaxMotorTorque_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetMotorTorque_1 = Module["_emscripten_bind_b2WheelJoint_GetMotorTorque_1"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetMotorTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_SetStiffness_1 = Module["_emscripten_bind_b2WheelJoint_SetStiffness_1"] = createExportWrapper("emscripten_bind_b2WheelJoint_SetStiffness_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetStiffness_0 = Module["_emscripten_bind_b2WheelJoint_GetStiffness_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetStiffness_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_SetDamping_1 = Module["_emscripten_bind_b2WheelJoint_SetDamping_1"] = createExportWrapper("emscripten_bind_b2WheelJoint_SetDamping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetDamping_0 = Module["_emscripten_bind_b2WheelJoint_GetDamping_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetDamping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetType_0 = Module["_emscripten_bind_b2WheelJoint_GetType_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetBodyA_0 = Module["_emscripten_bind_b2WheelJoint_GetBodyA_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetBodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetBodyB_0 = Module["_emscripten_bind_b2WheelJoint_GetBodyB_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetBodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetAnchorA_0 = Module["_emscripten_bind_b2WheelJoint_GetAnchorA_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetAnchorB_0 = Module["_emscripten_bind_b2WheelJoint_GetAnchorB_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetReactionForce_1 = Module["_emscripten_bind_b2WheelJoint_GetReactionForce_1"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetReactionForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetReactionTorque_1 = Module["_emscripten_bind_b2WheelJoint_GetReactionTorque_1"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetReactionTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetNext_0 = Module["_emscripten_bind_b2WheelJoint_GetNext_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetNext_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetUserData_0 = Module["_emscripten_bind_b2WheelJoint_GetUserData_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetUserData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint_GetCollideConnected_0 = Module["_emscripten_bind_b2WheelJoint_GetCollideConnected_0"] = createExportWrapper("emscripten_bind_b2WheelJoint_GetCollideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJoint___destroy___0 = Module["_emscripten_bind_b2WheelJoint___destroy___0"] = createExportWrapper("emscripten_bind_b2WheelJoint___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_b2WheelJointDef_0 = Module["_emscripten_bind_b2WheelJointDef_b2WheelJointDef_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_b2WheelJointDef_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_Initialize_4 = Module["_emscripten_bind_b2WheelJointDef_Initialize_4"] = createExportWrapper("emscripten_bind_b2WheelJointDef_Initialize_4");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_get_localAnchorA_0 = Module["_emscripten_bind_b2WheelJointDef_get_localAnchorA_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_get_localAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_set_localAnchorA_1 = Module["_emscripten_bind_b2WheelJointDef_set_localAnchorA_1"] = createExportWrapper("emscripten_bind_b2WheelJointDef_set_localAnchorA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_get_localAnchorB_0 = Module["_emscripten_bind_b2WheelJointDef_get_localAnchorB_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_get_localAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_set_localAnchorB_1 = Module["_emscripten_bind_b2WheelJointDef_set_localAnchorB_1"] = createExportWrapper("emscripten_bind_b2WheelJointDef_set_localAnchorB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_get_localAxisA_0 = Module["_emscripten_bind_b2WheelJointDef_get_localAxisA_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_get_localAxisA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_set_localAxisA_1 = Module["_emscripten_bind_b2WheelJointDef_set_localAxisA_1"] = createExportWrapper("emscripten_bind_b2WheelJointDef_set_localAxisA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_get_enableLimit_0 = Module["_emscripten_bind_b2WheelJointDef_get_enableLimit_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_get_enableLimit_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_set_enableLimit_1 = Module["_emscripten_bind_b2WheelJointDef_set_enableLimit_1"] = createExportWrapper("emscripten_bind_b2WheelJointDef_set_enableLimit_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_get_lowerTranslation_0 = Module["_emscripten_bind_b2WheelJointDef_get_lowerTranslation_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_get_lowerTranslation_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_set_lowerTranslation_1 = Module["_emscripten_bind_b2WheelJointDef_set_lowerTranslation_1"] = createExportWrapper("emscripten_bind_b2WheelJointDef_set_lowerTranslation_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_get_upperTranslation_0 = Module["_emscripten_bind_b2WheelJointDef_get_upperTranslation_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_get_upperTranslation_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_set_upperTranslation_1 = Module["_emscripten_bind_b2WheelJointDef_set_upperTranslation_1"] = createExportWrapper("emscripten_bind_b2WheelJointDef_set_upperTranslation_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_get_enableMotor_0 = Module["_emscripten_bind_b2WheelJointDef_get_enableMotor_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_get_enableMotor_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_set_enableMotor_1 = Module["_emscripten_bind_b2WheelJointDef_set_enableMotor_1"] = createExportWrapper("emscripten_bind_b2WheelJointDef_set_enableMotor_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_get_maxMotorTorque_0 = Module["_emscripten_bind_b2WheelJointDef_get_maxMotorTorque_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_get_maxMotorTorque_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_set_maxMotorTorque_1 = Module["_emscripten_bind_b2WheelJointDef_set_maxMotorTorque_1"] = createExportWrapper("emscripten_bind_b2WheelJointDef_set_maxMotorTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_get_motorSpeed_0 = Module["_emscripten_bind_b2WheelJointDef_get_motorSpeed_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_get_motorSpeed_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_set_motorSpeed_1 = Module["_emscripten_bind_b2WheelJointDef_set_motorSpeed_1"] = createExportWrapper("emscripten_bind_b2WheelJointDef_set_motorSpeed_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_get_stiffness_0 = Module["_emscripten_bind_b2WheelJointDef_get_stiffness_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_get_stiffness_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_set_stiffness_1 = Module["_emscripten_bind_b2WheelJointDef_set_stiffness_1"] = createExportWrapper("emscripten_bind_b2WheelJointDef_set_stiffness_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_get_damping_0 = Module["_emscripten_bind_b2WheelJointDef_get_damping_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_get_damping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_set_damping_1 = Module["_emscripten_bind_b2WheelJointDef_set_damping_1"] = createExportWrapper("emscripten_bind_b2WheelJointDef_set_damping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_get_type_0 = Module["_emscripten_bind_b2WheelJointDef_get_type_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_get_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_set_type_1 = Module["_emscripten_bind_b2WheelJointDef_set_type_1"] = createExportWrapper("emscripten_bind_b2WheelJointDef_set_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_get_userData_0 = Module["_emscripten_bind_b2WheelJointDef_get_userData_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_get_userData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_set_userData_1 = Module["_emscripten_bind_b2WheelJointDef_set_userData_1"] = createExportWrapper("emscripten_bind_b2WheelJointDef_set_userData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_get_bodyA_0 = Module["_emscripten_bind_b2WheelJointDef_get_bodyA_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_get_bodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_set_bodyA_1 = Module["_emscripten_bind_b2WheelJointDef_set_bodyA_1"] = createExportWrapper("emscripten_bind_b2WheelJointDef_set_bodyA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_get_bodyB_0 = Module["_emscripten_bind_b2WheelJointDef_get_bodyB_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_get_bodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_set_bodyB_1 = Module["_emscripten_bind_b2WheelJointDef_set_bodyB_1"] = createExportWrapper("emscripten_bind_b2WheelJointDef_set_bodyB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_get_collideConnected_0 = Module["_emscripten_bind_b2WheelJointDef_get_collideConnected_0"] = createExportWrapper("emscripten_bind_b2WheelJointDef_get_collideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef_set_collideConnected_1 = Module["_emscripten_bind_b2WheelJointDef_set_collideConnected_1"] = createExportWrapper("emscripten_bind_b2WheelJointDef_set_collideConnected_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2WheelJointDef___destroy___0 = Module["_emscripten_bind_b2WheelJointDef___destroy___0"] = createExportWrapper("emscripten_bind_b2WheelJointDef___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_SetLinearOffset_1 = Module["_emscripten_bind_b2MotorJoint_SetLinearOffset_1"] = createExportWrapper("emscripten_bind_b2MotorJoint_SetLinearOffset_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_GetLinearOffset_0 = Module["_emscripten_bind_b2MotorJoint_GetLinearOffset_0"] = createExportWrapper("emscripten_bind_b2MotorJoint_GetLinearOffset_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_SetAngularOffset_1 = Module["_emscripten_bind_b2MotorJoint_SetAngularOffset_1"] = createExportWrapper("emscripten_bind_b2MotorJoint_SetAngularOffset_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_GetAngularOffset_0 = Module["_emscripten_bind_b2MotorJoint_GetAngularOffset_0"] = createExportWrapper("emscripten_bind_b2MotorJoint_GetAngularOffset_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_SetMaxForce_1 = Module["_emscripten_bind_b2MotorJoint_SetMaxForce_1"] = createExportWrapper("emscripten_bind_b2MotorJoint_SetMaxForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_GetMaxForce_0 = Module["_emscripten_bind_b2MotorJoint_GetMaxForce_0"] = createExportWrapper("emscripten_bind_b2MotorJoint_GetMaxForce_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_SetMaxTorque_1 = Module["_emscripten_bind_b2MotorJoint_SetMaxTorque_1"] = createExportWrapper("emscripten_bind_b2MotorJoint_SetMaxTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_GetMaxTorque_0 = Module["_emscripten_bind_b2MotorJoint_GetMaxTorque_0"] = createExportWrapper("emscripten_bind_b2MotorJoint_GetMaxTorque_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_SetCorrectionFactor_1 = Module["_emscripten_bind_b2MotorJoint_SetCorrectionFactor_1"] = createExportWrapper("emscripten_bind_b2MotorJoint_SetCorrectionFactor_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_GetCorrectionFactor_0 = Module["_emscripten_bind_b2MotorJoint_GetCorrectionFactor_0"] = createExportWrapper("emscripten_bind_b2MotorJoint_GetCorrectionFactor_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_GetType_0 = Module["_emscripten_bind_b2MotorJoint_GetType_0"] = createExportWrapper("emscripten_bind_b2MotorJoint_GetType_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_GetBodyA_0 = Module["_emscripten_bind_b2MotorJoint_GetBodyA_0"] = createExportWrapper("emscripten_bind_b2MotorJoint_GetBodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_GetBodyB_0 = Module["_emscripten_bind_b2MotorJoint_GetBodyB_0"] = createExportWrapper("emscripten_bind_b2MotorJoint_GetBodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_GetAnchorA_0 = Module["_emscripten_bind_b2MotorJoint_GetAnchorA_0"] = createExportWrapper("emscripten_bind_b2MotorJoint_GetAnchorA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_GetAnchorB_0 = Module["_emscripten_bind_b2MotorJoint_GetAnchorB_0"] = createExportWrapper("emscripten_bind_b2MotorJoint_GetAnchorB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_GetReactionForce_1 = Module["_emscripten_bind_b2MotorJoint_GetReactionForce_1"] = createExportWrapper("emscripten_bind_b2MotorJoint_GetReactionForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_GetReactionTorque_1 = Module["_emscripten_bind_b2MotorJoint_GetReactionTorque_1"] = createExportWrapper("emscripten_bind_b2MotorJoint_GetReactionTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_GetNext_0 = Module["_emscripten_bind_b2MotorJoint_GetNext_0"] = createExportWrapper("emscripten_bind_b2MotorJoint_GetNext_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_GetUserData_0 = Module["_emscripten_bind_b2MotorJoint_GetUserData_0"] = createExportWrapper("emscripten_bind_b2MotorJoint_GetUserData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint_GetCollideConnected_0 = Module["_emscripten_bind_b2MotorJoint_GetCollideConnected_0"] = createExportWrapper("emscripten_bind_b2MotorJoint_GetCollideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJoint___destroy___0 = Module["_emscripten_bind_b2MotorJoint___destroy___0"] = createExportWrapper("emscripten_bind_b2MotorJoint___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_b2MotorJointDef_0 = Module["_emscripten_bind_b2MotorJointDef_b2MotorJointDef_0"] = createExportWrapper("emscripten_bind_b2MotorJointDef_b2MotorJointDef_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_Initialize_2 = Module["_emscripten_bind_b2MotorJointDef_Initialize_2"] = createExportWrapper("emscripten_bind_b2MotorJointDef_Initialize_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_get_linearOffset_0 = Module["_emscripten_bind_b2MotorJointDef_get_linearOffset_0"] = createExportWrapper("emscripten_bind_b2MotorJointDef_get_linearOffset_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_set_linearOffset_1 = Module["_emscripten_bind_b2MotorJointDef_set_linearOffset_1"] = createExportWrapper("emscripten_bind_b2MotorJointDef_set_linearOffset_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_get_angularOffset_0 = Module["_emscripten_bind_b2MotorJointDef_get_angularOffset_0"] = createExportWrapper("emscripten_bind_b2MotorJointDef_get_angularOffset_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_set_angularOffset_1 = Module["_emscripten_bind_b2MotorJointDef_set_angularOffset_1"] = createExportWrapper("emscripten_bind_b2MotorJointDef_set_angularOffset_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_get_maxForce_0 = Module["_emscripten_bind_b2MotorJointDef_get_maxForce_0"] = createExportWrapper("emscripten_bind_b2MotorJointDef_get_maxForce_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_set_maxForce_1 = Module["_emscripten_bind_b2MotorJointDef_set_maxForce_1"] = createExportWrapper("emscripten_bind_b2MotorJointDef_set_maxForce_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_get_maxTorque_0 = Module["_emscripten_bind_b2MotorJointDef_get_maxTorque_0"] = createExportWrapper("emscripten_bind_b2MotorJointDef_get_maxTorque_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_set_maxTorque_1 = Module["_emscripten_bind_b2MotorJointDef_set_maxTorque_1"] = createExportWrapper("emscripten_bind_b2MotorJointDef_set_maxTorque_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_get_correctionFactor_0 = Module["_emscripten_bind_b2MotorJointDef_get_correctionFactor_0"] = createExportWrapper("emscripten_bind_b2MotorJointDef_get_correctionFactor_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_set_correctionFactor_1 = Module["_emscripten_bind_b2MotorJointDef_set_correctionFactor_1"] = createExportWrapper("emscripten_bind_b2MotorJointDef_set_correctionFactor_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_get_type_0 = Module["_emscripten_bind_b2MotorJointDef_get_type_0"] = createExportWrapper("emscripten_bind_b2MotorJointDef_get_type_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_set_type_1 = Module["_emscripten_bind_b2MotorJointDef_set_type_1"] = createExportWrapper("emscripten_bind_b2MotorJointDef_set_type_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_get_userData_0 = Module["_emscripten_bind_b2MotorJointDef_get_userData_0"] = createExportWrapper("emscripten_bind_b2MotorJointDef_get_userData_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_set_userData_1 = Module["_emscripten_bind_b2MotorJointDef_set_userData_1"] = createExportWrapper("emscripten_bind_b2MotorJointDef_set_userData_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_get_bodyA_0 = Module["_emscripten_bind_b2MotorJointDef_get_bodyA_0"] = createExportWrapper("emscripten_bind_b2MotorJointDef_get_bodyA_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_set_bodyA_1 = Module["_emscripten_bind_b2MotorJointDef_set_bodyA_1"] = createExportWrapper("emscripten_bind_b2MotorJointDef_set_bodyA_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_get_bodyB_0 = Module["_emscripten_bind_b2MotorJointDef_get_bodyB_0"] = createExportWrapper("emscripten_bind_b2MotorJointDef_get_bodyB_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_set_bodyB_1 = Module["_emscripten_bind_b2MotorJointDef_set_bodyB_1"] = createExportWrapper("emscripten_bind_b2MotorJointDef_set_bodyB_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_get_collideConnected_0 = Module["_emscripten_bind_b2MotorJointDef_get_collideConnected_0"] = createExportWrapper("emscripten_bind_b2MotorJointDef_get_collideConnected_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef_set_collideConnected_1 = Module["_emscripten_bind_b2MotorJointDef_set_collideConnected_1"] = createExportWrapper("emscripten_bind_b2MotorJointDef_set_collideConnected_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2MotorJointDef___destroy___0 = Module["_emscripten_bind_b2MotorJointDef___destroy___0"] = createExportWrapper("emscripten_bind_b2MotorJointDef___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_b2RopeTuning_0 = Module["_emscripten_bind_b2RopeTuning_b2RopeTuning_0"] = createExportWrapper("emscripten_bind_b2RopeTuning_b2RopeTuning_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_get_stretchingModel_0 = Module["_emscripten_bind_b2RopeTuning_get_stretchingModel_0"] = createExportWrapper("emscripten_bind_b2RopeTuning_get_stretchingModel_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_set_stretchingModel_1 = Module["_emscripten_bind_b2RopeTuning_set_stretchingModel_1"] = createExportWrapper("emscripten_bind_b2RopeTuning_set_stretchingModel_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_get_bendingModel_0 = Module["_emscripten_bind_b2RopeTuning_get_bendingModel_0"] = createExportWrapper("emscripten_bind_b2RopeTuning_get_bendingModel_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_set_bendingModel_1 = Module["_emscripten_bind_b2RopeTuning_set_bendingModel_1"] = createExportWrapper("emscripten_bind_b2RopeTuning_set_bendingModel_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_get_damping_0 = Module["_emscripten_bind_b2RopeTuning_get_damping_0"] = createExportWrapper("emscripten_bind_b2RopeTuning_get_damping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_set_damping_1 = Module["_emscripten_bind_b2RopeTuning_set_damping_1"] = createExportWrapper("emscripten_bind_b2RopeTuning_set_damping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_get_stretchStiffness_0 = Module["_emscripten_bind_b2RopeTuning_get_stretchStiffness_0"] = createExportWrapper("emscripten_bind_b2RopeTuning_get_stretchStiffness_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_set_stretchStiffness_1 = Module["_emscripten_bind_b2RopeTuning_set_stretchStiffness_1"] = createExportWrapper("emscripten_bind_b2RopeTuning_set_stretchStiffness_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_get_stretchHertz_0 = Module["_emscripten_bind_b2RopeTuning_get_stretchHertz_0"] = createExportWrapper("emscripten_bind_b2RopeTuning_get_stretchHertz_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_set_stretchHertz_1 = Module["_emscripten_bind_b2RopeTuning_set_stretchHertz_1"] = createExportWrapper("emscripten_bind_b2RopeTuning_set_stretchHertz_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_get_stretchDamping_0 = Module["_emscripten_bind_b2RopeTuning_get_stretchDamping_0"] = createExportWrapper("emscripten_bind_b2RopeTuning_get_stretchDamping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_set_stretchDamping_1 = Module["_emscripten_bind_b2RopeTuning_set_stretchDamping_1"] = createExportWrapper("emscripten_bind_b2RopeTuning_set_stretchDamping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_get_bendStiffness_0 = Module["_emscripten_bind_b2RopeTuning_get_bendStiffness_0"] = createExportWrapper("emscripten_bind_b2RopeTuning_get_bendStiffness_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_set_bendStiffness_1 = Module["_emscripten_bind_b2RopeTuning_set_bendStiffness_1"] = createExportWrapper("emscripten_bind_b2RopeTuning_set_bendStiffness_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_get_bendHertz_0 = Module["_emscripten_bind_b2RopeTuning_get_bendHertz_0"] = createExportWrapper("emscripten_bind_b2RopeTuning_get_bendHertz_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_set_bendHertz_1 = Module["_emscripten_bind_b2RopeTuning_set_bendHertz_1"] = createExportWrapper("emscripten_bind_b2RopeTuning_set_bendHertz_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_get_bendDamping_0 = Module["_emscripten_bind_b2RopeTuning_get_bendDamping_0"] = createExportWrapper("emscripten_bind_b2RopeTuning_get_bendDamping_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_set_bendDamping_1 = Module["_emscripten_bind_b2RopeTuning_set_bendDamping_1"] = createExportWrapper("emscripten_bind_b2RopeTuning_set_bendDamping_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_get_isometric_0 = Module["_emscripten_bind_b2RopeTuning_get_isometric_0"] = createExportWrapper("emscripten_bind_b2RopeTuning_get_isometric_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_set_isometric_1 = Module["_emscripten_bind_b2RopeTuning_set_isometric_1"] = createExportWrapper("emscripten_bind_b2RopeTuning_set_isometric_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_get_fixedEffectiveMass_0 = Module["_emscripten_bind_b2RopeTuning_get_fixedEffectiveMass_0"] = createExportWrapper("emscripten_bind_b2RopeTuning_get_fixedEffectiveMass_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_set_fixedEffectiveMass_1 = Module["_emscripten_bind_b2RopeTuning_set_fixedEffectiveMass_1"] = createExportWrapper("emscripten_bind_b2RopeTuning_set_fixedEffectiveMass_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_get_warmStart_0 = Module["_emscripten_bind_b2RopeTuning_get_warmStart_0"] = createExportWrapper("emscripten_bind_b2RopeTuning_get_warmStart_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning_set_warmStart_1 = Module["_emscripten_bind_b2RopeTuning_set_warmStart_1"] = createExportWrapper("emscripten_bind_b2RopeTuning_set_warmStart_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeTuning___destroy___0 = Module["_emscripten_bind_b2RopeTuning___destroy___0"] = createExportWrapper("emscripten_bind_b2RopeTuning___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeDef_b2RopeDef_0 = Module["_emscripten_bind_b2RopeDef_b2RopeDef_0"] = createExportWrapper("emscripten_bind_b2RopeDef_b2RopeDef_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeDef_get_position_0 = Module["_emscripten_bind_b2RopeDef_get_position_0"] = createExportWrapper("emscripten_bind_b2RopeDef_get_position_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeDef_set_position_1 = Module["_emscripten_bind_b2RopeDef_set_position_1"] = createExportWrapper("emscripten_bind_b2RopeDef_set_position_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeDef_get_vertices_0 = Module["_emscripten_bind_b2RopeDef_get_vertices_0"] = createExportWrapper("emscripten_bind_b2RopeDef_get_vertices_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeDef_set_vertices_1 = Module["_emscripten_bind_b2RopeDef_set_vertices_1"] = createExportWrapper("emscripten_bind_b2RopeDef_set_vertices_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeDef_get_count_0 = Module["_emscripten_bind_b2RopeDef_get_count_0"] = createExportWrapper("emscripten_bind_b2RopeDef_get_count_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeDef_set_count_1 = Module["_emscripten_bind_b2RopeDef_set_count_1"] = createExportWrapper("emscripten_bind_b2RopeDef_set_count_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeDef_get_gravity_0 = Module["_emscripten_bind_b2RopeDef_get_gravity_0"] = createExportWrapper("emscripten_bind_b2RopeDef_get_gravity_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeDef_set_gravity_1 = Module["_emscripten_bind_b2RopeDef_set_gravity_1"] = createExportWrapper("emscripten_bind_b2RopeDef_set_gravity_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeDef_get_tuning_0 = Module["_emscripten_bind_b2RopeDef_get_tuning_0"] = createExportWrapper("emscripten_bind_b2RopeDef_get_tuning_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeDef_set_tuning_1 = Module["_emscripten_bind_b2RopeDef_set_tuning_1"] = createExportWrapper("emscripten_bind_b2RopeDef_set_tuning_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeDef___destroy___0 = Module["_emscripten_bind_b2RopeDef___destroy___0"] = createExportWrapper("emscripten_bind_b2RopeDef___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rope_b2Rope_0 = Module["_emscripten_bind_b2Rope_b2Rope_0"] = createExportWrapper("emscripten_bind_b2Rope_b2Rope_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rope_Create_1 = Module["_emscripten_bind_b2Rope_Create_1"] = createExportWrapper("emscripten_bind_b2Rope_Create_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rope_SetTuning_1 = Module["_emscripten_bind_b2Rope_SetTuning_1"] = createExportWrapper("emscripten_bind_b2Rope_SetTuning_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rope_Step_3 = Module["_emscripten_bind_b2Rope_Step_3"] = createExportWrapper("emscripten_bind_b2Rope_Step_3");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rope_Reset_1 = Module["_emscripten_bind_b2Rope_Reset_1"] = createExportWrapper("emscripten_bind_b2Rope_Reset_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rope_Draw_1 = Module["_emscripten_bind_b2Rope_Draw_1"] = createExportWrapper("emscripten_bind_b2Rope_Draw_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2Rope___destroy___0 = Module["_emscripten_bind_b2Rope___destroy___0"] = createExportWrapper("emscripten_bind_b2Rope___destroy___0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ClipVertex_b2ClipVertex_0 = Module["_emscripten_bind_b2ClipVertex_b2ClipVertex_0"] = createExportWrapper("emscripten_bind_b2ClipVertex_b2ClipVertex_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ClipVertex_get_v_0 = Module["_emscripten_bind_b2ClipVertex_get_v_0"] = createExportWrapper("emscripten_bind_b2ClipVertex_get_v_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ClipVertex_set_v_1 = Module["_emscripten_bind_b2ClipVertex_set_v_1"] = createExportWrapper("emscripten_bind_b2ClipVertex_set_v_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ClipVertex_get_id_0 = Module["_emscripten_bind_b2ClipVertex_get_id_0"] = createExportWrapper("emscripten_bind_b2ClipVertex_get_id_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2ClipVertex_set_id_1 = Module["_emscripten_bind_b2ClipVertex_set_id_1"] = createExportWrapper("emscripten_bind_b2ClipVertex_set_id_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2ClipVertex___destroy___0 = Module["_emscripten_bind_b2ClipVertex___destroy___0"] = createExportWrapper("emscripten_bind_b2ClipVertex___destroy___0");

/** @type {function(...*):?} */
var _emscripten_enum_b2ShapeType_e_circle = Module["_emscripten_enum_b2ShapeType_e_circle"] = createExportWrapper("emscripten_enum_b2ShapeType_e_circle");

/** @type {function(...*):?} */
var _emscripten_enum_b2ShapeType_e_edge = Module["_emscripten_enum_b2ShapeType_e_edge"] = createExportWrapper("emscripten_enum_b2ShapeType_e_edge");

/** @type {function(...*):?} */
var _emscripten_enum_b2ShapeType_e_polygon = Module["_emscripten_enum_b2ShapeType_e_polygon"] = createExportWrapper("emscripten_enum_b2ShapeType_e_polygon");

/** @type {function(...*):?} */
var _emscripten_enum_b2ShapeType_e_chain = Module["_emscripten_enum_b2ShapeType_e_chain"] = createExportWrapper("emscripten_enum_b2ShapeType_e_chain");

/** @type {function(...*):?} */
var _emscripten_enum_b2ShapeType_e_typeCount = Module["_emscripten_enum_b2ShapeType_e_typeCount"] = createExportWrapper("emscripten_enum_b2ShapeType_e_typeCount");

/** @type {function(...*):?} */
var _emscripten_enum_b2BodyType_b2_staticBody = Module["_emscripten_enum_b2BodyType_b2_staticBody"] = createExportWrapper("emscripten_enum_b2BodyType_b2_staticBody");

/** @type {function(...*):?} */
var _emscripten_enum_b2BodyType_b2_kinematicBody = Module["_emscripten_enum_b2BodyType_b2_kinematicBody"] = createExportWrapper("emscripten_enum_b2BodyType_b2_kinematicBody");

/** @type {function(...*):?} */
var _emscripten_enum_b2BodyType_b2_dynamicBody = Module["_emscripten_enum_b2BodyType_b2_dynamicBody"] = createExportWrapper("emscripten_enum_b2BodyType_b2_dynamicBody");

/** @type {function(...*):?} */
var _emscripten_enum_b2JointType_e_unknownJoint = Module["_emscripten_enum_b2JointType_e_unknownJoint"] = createExportWrapper("emscripten_enum_b2JointType_e_unknownJoint");

/** @type {function(...*):?} */
var _emscripten_enum_b2JointType_e_revoluteJoint = Module["_emscripten_enum_b2JointType_e_revoluteJoint"] = createExportWrapper("emscripten_enum_b2JointType_e_revoluteJoint");

/** @type {function(...*):?} */
var _emscripten_enum_b2JointType_e_prismaticJoint = Module["_emscripten_enum_b2JointType_e_prismaticJoint"] = createExportWrapper("emscripten_enum_b2JointType_e_prismaticJoint");

/** @type {function(...*):?} */
var _emscripten_enum_b2JointType_e_distanceJoint = Module["_emscripten_enum_b2JointType_e_distanceJoint"] = createExportWrapper("emscripten_enum_b2JointType_e_distanceJoint");

/** @type {function(...*):?} */
var _emscripten_enum_b2JointType_e_pulleyJoint = Module["_emscripten_enum_b2JointType_e_pulleyJoint"] = createExportWrapper("emscripten_enum_b2JointType_e_pulleyJoint");

/** @type {function(...*):?} */
var _emscripten_enum_b2JointType_e_mouseJoint = Module["_emscripten_enum_b2JointType_e_mouseJoint"] = createExportWrapper("emscripten_enum_b2JointType_e_mouseJoint");

/** @type {function(...*):?} */
var _emscripten_enum_b2JointType_e_gearJoint = Module["_emscripten_enum_b2JointType_e_gearJoint"] = createExportWrapper("emscripten_enum_b2JointType_e_gearJoint");

/** @type {function(...*):?} */
var _emscripten_enum_b2JointType_e_wheelJoint = Module["_emscripten_enum_b2JointType_e_wheelJoint"] = createExportWrapper("emscripten_enum_b2JointType_e_wheelJoint");

/** @type {function(...*):?} */
var _emscripten_enum_b2JointType_e_weldJoint = Module["_emscripten_enum_b2JointType_e_weldJoint"] = createExportWrapper("emscripten_enum_b2JointType_e_weldJoint");

/** @type {function(...*):?} */
var _emscripten_enum_b2JointType_e_frictionJoint = Module["_emscripten_enum_b2JointType_e_frictionJoint"] = createExportWrapper("emscripten_enum_b2JointType_e_frictionJoint");

/** @type {function(...*):?} */
var _emscripten_enum_b2JointType_e_ropeJoint = Module["_emscripten_enum_b2JointType_e_ropeJoint"] = createExportWrapper("emscripten_enum_b2JointType_e_ropeJoint");

/** @type {function(...*):?} */
var _emscripten_enum_b2JointType_e_motorJoint = Module["_emscripten_enum_b2JointType_e_motorJoint"] = createExportWrapper("emscripten_enum_b2JointType_e_motorJoint");

/** @type {function(...*):?} */
var _emscripten_enum_b2ContactFeatureType_e_vertex = Module["_emscripten_enum_b2ContactFeatureType_e_vertex"] = createExportWrapper("emscripten_enum_b2ContactFeatureType_e_vertex");

/** @type {function(...*):?} */
var _emscripten_enum_b2ContactFeatureType_e_face = Module["_emscripten_enum_b2ContactFeatureType_e_face"] = createExportWrapper("emscripten_enum_b2ContactFeatureType_e_face");

/** @type {function(...*):?} */
var _emscripten_enum_b2DrawFlag_e_shapeBit = Module["_emscripten_enum_b2DrawFlag_e_shapeBit"] = createExportWrapper("emscripten_enum_b2DrawFlag_e_shapeBit");

/** @type {function(...*):?} */
var _emscripten_enum_b2DrawFlag_e_jointBit = Module["_emscripten_enum_b2DrawFlag_e_jointBit"] = createExportWrapper("emscripten_enum_b2DrawFlag_e_jointBit");

/** @type {function(...*):?} */
var _emscripten_enum_b2DrawFlag_e_aabbBit = Module["_emscripten_enum_b2DrawFlag_e_aabbBit"] = createExportWrapper("emscripten_enum_b2DrawFlag_e_aabbBit");

/** @type {function(...*):?} */
var _emscripten_enum_b2DrawFlag_e_pairBit = Module["_emscripten_enum_b2DrawFlag_e_pairBit"] = createExportWrapper("emscripten_enum_b2DrawFlag_e_pairBit");

/** @type {function(...*):?} */
var _emscripten_enum_b2DrawFlag_e_centerOfMassBit = Module["_emscripten_enum_b2DrawFlag_e_centerOfMassBit"] = createExportWrapper("emscripten_enum_b2DrawFlag_e_centerOfMassBit");

/** @type {function(...*):?} */
var _emscripten_enum_b2ManifoldType_e_circles = Module["_emscripten_enum_b2ManifoldType_e_circles"] = createExportWrapper("emscripten_enum_b2ManifoldType_e_circles");

/** @type {function(...*):?} */
var _emscripten_enum_b2ManifoldType_e_faceA = Module["_emscripten_enum_b2ManifoldType_e_faceA"] = createExportWrapper("emscripten_enum_b2ManifoldType_e_faceA");

/** @type {function(...*):?} */
var _emscripten_enum_b2ManifoldType_e_faceB = Module["_emscripten_enum_b2ManifoldType_e_faceB"] = createExportWrapper("emscripten_enum_b2ManifoldType_e_faceB");

/** @type {function(...*):?} */
var _emscripten_enum_b2PointState_b2_nullState = Module["_emscripten_enum_b2PointState_b2_nullState"] = createExportWrapper("emscripten_enum_b2PointState_b2_nullState");

/** @type {function(...*):?} */
var _emscripten_enum_b2PointState_b2_addState = Module["_emscripten_enum_b2PointState_b2_addState"] = createExportWrapper("emscripten_enum_b2PointState_b2_addState");

/** @type {function(...*):?} */
var _emscripten_enum_b2PointState_b2_persistState = Module["_emscripten_enum_b2PointState_b2_persistState"] = createExportWrapper("emscripten_enum_b2PointState_b2_persistState");

/** @type {function(...*):?} */
var _emscripten_enum_b2PointState_b2_removeState = Module["_emscripten_enum_b2PointState_b2_removeState"] = createExportWrapper("emscripten_enum_b2PointState_b2_removeState");

/** @type {function(...*):?} */
var _emscripten_enum_b2StretchingModel_b2_pbdStretchingModel = Module["_emscripten_enum_b2StretchingModel_b2_pbdStretchingModel"] = createExportWrapper("emscripten_enum_b2StretchingModel_b2_pbdStretchingModel");

/** @type {function(...*):?} */
var _emscripten_enum_b2StretchingModel_b2_xpbdStretchingModel = Module["_emscripten_enum_b2StretchingModel_b2_xpbdStretchingModel"] = createExportWrapper("emscripten_enum_b2StretchingModel_b2_xpbdStretchingModel");

/** @type {function(...*):?} */
var _emscripten_enum_b2BendingModel_b2_springAngleBendingModel = Module["_emscripten_enum_b2BendingModel_b2_springAngleBendingModel"] = createExportWrapper("emscripten_enum_b2BendingModel_b2_springAngleBendingModel");

/** @type {function(...*):?} */
var _emscripten_enum_b2BendingModel_b2_pbdAngleBendingModel = Module["_emscripten_enum_b2BendingModel_b2_pbdAngleBendingModel"] = createExportWrapper("emscripten_enum_b2BendingModel_b2_pbdAngleBendingModel");

/** @type {function(...*):?} */
var _emscripten_enum_b2BendingModel_b2_xpbdAngleBendingModel = Module["_emscripten_enum_b2BendingModel_b2_xpbdAngleBendingModel"] = createExportWrapper("emscripten_enum_b2BendingModel_b2_xpbdAngleBendingModel");

/** @type {function(...*):?} */
var _emscripten_enum_b2BendingModel_b2_pbdDistanceBendingModel = Module["_emscripten_enum_b2BendingModel_b2_pbdDistanceBendingModel"] = createExportWrapper("emscripten_enum_b2BendingModel_b2_pbdDistanceBendingModel");

/** @type {function(...*):?} */
var _emscripten_enum_b2BendingModel_b2_pbdHeightBendingModel = Module["_emscripten_enum_b2BendingModel_b2_pbdHeightBendingModel"] = createExportWrapper("emscripten_enum_b2BendingModel_b2_pbdHeightBendingModel");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeDef_get_masses_0 = Module["_emscripten_bind_b2RopeDef_get_masses_0"] = createExportWrapper("emscripten_bind_b2RopeDef_get_masses_0");

/** @type {function(...*):?} */
var _emscripten_bind_b2RopeDef_set_masses_1 = Module["_emscripten_bind_b2RopeDef_set_masses_1"] = createExportWrapper("emscripten_bind_b2RopeDef_set_masses_1");

/** @type {function(...*):?} */
var _emscripten_bind_b2GetPointStates_4 = Module["_emscripten_bind_b2GetPointStates_4"] = createExportWrapper("emscripten_bind_b2GetPointStates_4");

/** @type {function(...*):?} */
var _emscripten_bind_b2CollideCircles_5 = Module["_emscripten_bind_b2CollideCircles_5"] = createExportWrapper("emscripten_bind_b2CollideCircles_5");

/** @type {function(...*):?} */
var _emscripten_bind_b2CollidePolygonAndCircle_5 = Module["_emscripten_bind_b2CollidePolygonAndCircle_5"] = createExportWrapper("emscripten_bind_b2CollidePolygonAndCircle_5");

/** @type {function(...*):?} */
var _emscripten_bind_b2CollidePolygons_5 = Module["_emscripten_bind_b2CollidePolygons_5"] = createExportWrapper("emscripten_bind_b2CollidePolygons_5");

/** @type {function(...*):?} */
var _emscripten_bind_b2CollideEdgeAndCircle_5 = Module["_emscripten_bind_b2CollideEdgeAndCircle_5"] = createExportWrapper("emscripten_bind_b2CollideEdgeAndCircle_5");

/** @type {function(...*):?} */
var _emscripten_bind_b2CollideEdgeAndPolygon_5 = Module["_emscripten_bind_b2CollideEdgeAndPolygon_5"] = createExportWrapper("emscripten_bind_b2CollideEdgeAndPolygon_5");

/** @type {function(...*):?} */
var _emscripten_bind_b2ClipSegmentToLine_5 = Module["_emscripten_bind_b2ClipSegmentToLine_5"] = createExportWrapper("emscripten_bind_b2ClipSegmentToLine_5");

/** @type {function(...*):?} */
var _emscripten_bind_b2TestOverlap_6 = Module["_emscripten_bind_b2TestOverlap_6"] = createExportWrapper("emscripten_bind_b2TestOverlap_6");

/** @type {function(...*):?} */
var _emscripten_bind_b2TestOverlap_2 = Module["_emscripten_bind_b2TestOverlap_2"] = createExportWrapper("emscripten_bind_b2TestOverlap_2");

/** @type {function(...*):?} */
var _emscripten_bind_b2LinearStiffness_6 = Module["_emscripten_bind_b2LinearStiffness_6"] = createExportWrapper("emscripten_bind_b2LinearStiffness_6");

/** @type {function(...*):?} */
var _emscripten_bind_b2AngularStiffness_6 = Module["_emscripten_bind_b2AngularStiffness_6"] = createExportWrapper("emscripten_bind_b2AngularStiffness_6");

/** @type {function(...*):?} */
var ___errno_location = Module["___errno_location"] = createExportWrapper("__errno_location");

/** @type {function(...*):?} */
var _fflush = Module["_fflush"] = createExportWrapper("fflush");

/** @type {function(...*):?} */
var _emscripten_stack_init = Module["_emscripten_stack_init"] = function() {
  return (_emscripten_stack_init = Module["_emscripten_stack_init"] = Module["asm"]["emscripten_stack_init"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = function() {
  return (_emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = Module["asm"]["emscripten_stack_get_free"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_base = Module["_emscripten_stack_get_base"] = function() {
  return (_emscripten_stack_get_base = Module["_emscripten_stack_get_base"] = Module["asm"]["emscripten_stack_get_base"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = function() {
  return (_emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = Module["asm"]["emscripten_stack_get_end"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var stackSave = Module["stackSave"] = createExportWrapper("stackSave");

/** @type {function(...*):?} */
var stackRestore = Module["stackRestore"] = createExportWrapper("stackRestore");

/** @type {function(...*):?} */
var stackAlloc = Module["stackAlloc"] = createExportWrapper("stackAlloc");

/** @type {function(...*):?} */
var dynCall_jiji = Module["dynCall_jiji"] = createExportWrapper("dynCall_jiji");

var ___start_em_js = Module['___start_em_js'] = 20176;
var ___stop_em_js = Module['___stop_em_js'] = 20274;



// === Auto-generated postamble setup entry stuff ===


var unexportedRuntimeSymbols = [
  'run',
  'UTF8ArrayToString',
  'UTF8ToString',
  'stringToUTF8Array',
  'stringToUTF8',
  'lengthBytesUTF8',
  'addOnPreRun',
  'addOnInit',
  'addOnPreMain',
  'addOnExit',
  'addOnPostRun',
  'addRunDependency',
  'removeRunDependency',
  'FS_createFolder',
  'FS_createPath',
  'FS_createDataFile',
  'FS_createPreloadedFile',
  'FS_createLazyFile',
  'FS_createLink',
  'FS_createDevice',
  'FS_unlink',
  'getLEB',
  'getFunctionTables',
  'alignFunctionTables',
  'registerFunctions',
  'prettyPrint',
  'getCompilerSetting',
  'print',
  'printErr',
  'callMain',
  'abort',
  'keepRuntimeAlive',
  'wasmMemory',
  'stackAlloc',
  'stackSave',
  'stackRestore',
  'getTempRet0',
  'setTempRet0',
  'writeStackCookie',
  'checkStackCookie',
  'ptrToString',
  'zeroMemory',
  'stringToNewUTF8',
  'exitJS',
  'getHeapMax',
  'abortOnCannotGrowMemory',
  'emscripten_realloc_buffer',
  'ENV',
  'ERRNO_CODES',
  'ERRNO_MESSAGES',
  'setErrNo',
  'inetPton4',
  'inetNtop4',
  'inetPton6',
  'inetNtop6',
  'readSockaddr',
  'writeSockaddr',
  'DNS',
  'getHostByName',
  'Protocols',
  'Sockets',
  'getRandomDevice',
  'warnOnce',
  'traverseStack',
  'UNWIND_CACHE',
  'convertPCtoSourceLocation',
  'readAsmConstArgsArray',
  'readAsmConstArgs',
  'mainThreadEM_ASM',
  'jstoi_q',
  'jstoi_s',
  'getExecutableName',
  'listenOnce',
  'autoResumeAudioContext',
  'dynCallLegacy',
  'getDynCaller',
  'dynCall',
  'handleException',
  'runtimeKeepalivePush',
  'runtimeKeepalivePop',
  'callUserCallback',
  'maybeExit',
  'safeSetTimeout',
  'asmjsMangle',
  'asyncLoad',
  'alignMemory',
  'mmapAlloc',
  'writeI53ToI64',
  'writeI53ToI64Clamped',
  'writeI53ToI64Signaling',
  'writeI53ToU64Clamped',
  'writeI53ToU64Signaling',
  'readI53FromI64',
  'readI53FromU64',
  'convertI32PairToI53',
  'convertI32PairToI53Checked',
  'convertU32PairToI53',
  'getCFunc',
  'ccall',
  'cwrap',
  'uleb128Encode',
  'sigToWasmTypes',
  'generateFuncType',
  'convertJsFunctionToWasm',
  'freeTableIndexes',
  'functionsInTableMap',
  'getEmptyTableSlot',
  'updateTableMap',
  'addFunction',
  'removeFunction',
  'reallyNegative',
  'unSign',
  'strLen',
  'reSign',
  'formatString',
  'setValue',
  'getValue',
  'PATH',
  'PATH_FS',
  'intArrayFromString',
  'intArrayToString',
  'AsciiToString',
  'stringToAscii',
  'UTF16Decoder',
  'UTF16ToString',
  'stringToUTF16',
  'lengthBytesUTF16',
  'UTF32ToString',
  'stringToUTF32',
  'lengthBytesUTF32',
  'allocateUTF8',
  'allocateUTF8OnStack',
  'writeStringToMemory',
  'writeArrayToMemory',
  'writeAsciiToMemory',
  'SYSCALLS',
  'getSocketFromFD',
  'getSocketAddress',
  'JSEvents',
  'registerKeyEventCallback',
  'specialHTMLTargets',
  'maybeCStringToJsString',
  'findEventTarget',
  'findCanvasEventTarget',
  'getBoundingClientRect',
  'fillMouseEventData',
  'registerMouseEventCallback',
  'registerWheelEventCallback',
  'registerUiEventCallback',
  'registerFocusEventCallback',
  'fillDeviceOrientationEventData',
  'registerDeviceOrientationEventCallback',
  'fillDeviceMotionEventData',
  'registerDeviceMotionEventCallback',
  'screenOrientation',
  'fillOrientationChangeEventData',
  'registerOrientationChangeEventCallback',
  'fillFullscreenChangeEventData',
  'registerFullscreenChangeEventCallback',
  'JSEvents_requestFullscreen',
  'JSEvents_resizeCanvasForFullscreen',
  'registerRestoreOldStyle',
  'hideEverythingExceptGivenElement',
  'restoreHiddenElements',
  'setLetterbox',
  'currentFullscreenStrategy',
  'restoreOldWindowedStyle',
  'softFullscreenResizeWebGLRenderTarget',
  'doRequestFullscreen',
  'fillPointerlockChangeEventData',
  'registerPointerlockChangeEventCallback',
  'registerPointerlockErrorEventCallback',
  'requestPointerLock',
  'fillVisibilityChangeEventData',
  'registerVisibilityChangeEventCallback',
  'registerTouchEventCallback',
  'fillGamepadEventData',
  'registerGamepadEventCallback',
  'registerBeforeUnloadEventCallback',
  'fillBatteryEventData',
  'battery',
  'registerBatteryEventCallback',
  'setCanvasElementSize',
  'getCanvasElementSize',
  'demangle',
  'demangleAll',
  'jsStackTrace',
  'stackTrace',
  'ExitStatus',
  'getEnvStrings',
  'checkWasiClock',
  'doReadv',
  'doWritev',
  'dlopenMissingError',
  'createDyncallWrapper',
  'setImmediateWrapped',
  'clearImmediateWrapped',
  'polyfillSetImmediate',
  'uncaughtExceptionCount',
  'exceptionLast',
  'exceptionCaught',
  'ExceptionInfo',
  'exception_addRef',
  'exception_decRef',
  'Browser',
  'setMainLoop',
  'wget',
  'FS',
  'MEMFS',
  'TTY',
  'PIPEFS',
  'SOCKFS',
  '_setNetworkCallback',
  'tempFixedLengthArray',
  'miniTempWebGLFloatBuffers',
  'heapObjectForWebGLType',
  'heapAccessShiftForWebGLHeap',
  'GL',
  'emscriptenWebGLGet',
  'computeUnpackAlignedImageSize',
  'emscriptenWebGLGetTexPixelData',
  'emscriptenWebGLGetUniform',
  'webglGetUniformLocation',
  'webglPrepareUniformLocationsBeforeFirstUse',
  'webglGetLeftBracePos',
  'emscriptenWebGLGetVertexAttrib',
  'writeGLArray',
  'AL',
  'SDL_unicode',
  'SDL_ttfContext',
  'SDL_audio',
  'SDL',
  'SDL_gfx',
  'GLUT',
  'EGL',
  'GLFW_Window',
  'GLFW',
  'GLEW',
  'IDBStore',
  'runAndAbortIfError',
  'ALLOC_NORMAL',
  'ALLOC_STACK',
  'allocate',
];
unexportedRuntimeSymbols.forEach(unexportedRuntimeSymbol);
var missingLibrarySymbols = [
  'ptrToString',
  'stringToNewUTF8',
  'exitJS',
  'emscripten_realloc_buffer',
  'inetPton4',
  'inetNtop4',
  'inetPton6',
  'inetNtop6',
  'readSockaddr',
  'writeSockaddr',
  'getHostByName',
  'traverseStack',
  'convertPCtoSourceLocation',
  'mainThreadEM_ASM',
  'jstoi_q',
  'jstoi_s',
  'getExecutableName',
  'listenOnce',
  'autoResumeAudioContext',
  'dynCallLegacy',
  'getDynCaller',
  'dynCall',
  'runtimeKeepalivePush',
  'runtimeKeepalivePop',
  'callUserCallback',
  'maybeExit',
  'safeSetTimeout',
  'asmjsMangle',
  'writeI53ToI64',
  'writeI53ToI64Clamped',
  'writeI53ToI64Signaling',
  'writeI53ToU64Clamped',
  'writeI53ToU64Signaling',
  'readI53FromI64',
  'readI53FromU64',
  'convertI32PairToI53',
  'convertU32PairToI53',
  'getCFunc',
  'ccall',
  'cwrap',
  'uleb128Encode',
  'sigToWasmTypes',
  'generateFuncType',
  'convertJsFunctionToWasm',
  'getEmptyTableSlot',
  'updateTableMap',
  'addFunction',
  'removeFunction',
  'reallyNegative',
  'unSign',
  'strLen',
  'reSign',
  'formatString',
  'intArrayToString',
  'AsciiToString',
  'stringToAscii',
  'UTF16ToString',
  'stringToUTF16',
  'lengthBytesUTF16',
  'UTF32ToString',
  'stringToUTF32',
  'lengthBytesUTF32',
  'allocateUTF8',
  'allocateUTF8OnStack',
  'writeStringToMemory',
  'writeAsciiToMemory',
  'getSocketFromFD',
  'getSocketAddress',
  'registerKeyEventCallback',
  'maybeCStringToJsString',
  'findEventTarget',
  'findCanvasEventTarget',
  'getBoundingClientRect',
  'fillMouseEventData',
  'registerMouseEventCallback',
  'registerWheelEventCallback',
  'registerUiEventCallback',
  'registerFocusEventCallback',
  'fillDeviceOrientationEventData',
  'registerDeviceOrientationEventCallback',
  'fillDeviceMotionEventData',
  'registerDeviceMotionEventCallback',
  'screenOrientation',
  'fillOrientationChangeEventData',
  'registerOrientationChangeEventCallback',
  'fillFullscreenChangeEventData',
  'registerFullscreenChangeEventCallback',
  'JSEvents_requestFullscreen',
  'JSEvents_resizeCanvasForFullscreen',
  'registerRestoreOldStyle',
  'hideEverythingExceptGivenElement',
  'restoreHiddenElements',
  'setLetterbox',
  'softFullscreenResizeWebGLRenderTarget',
  'doRequestFullscreen',
  'fillPointerlockChangeEventData',
  'registerPointerlockChangeEventCallback',
  'registerPointerlockErrorEventCallback',
  'requestPointerLock',
  'fillVisibilityChangeEventData',
  'registerVisibilityChangeEventCallback',
  'registerTouchEventCallback',
  'fillGamepadEventData',
  'registerGamepadEventCallback',
  'registerBeforeUnloadEventCallback',
  'fillBatteryEventData',
  'battery',
  'registerBatteryEventCallback',
  'setCanvasElementSize',
  'getCanvasElementSize',
  'getEnvStrings',
  'checkWasiClock',
  'createDyncallWrapper',
  'setImmediateWrapped',
  'clearImmediateWrapped',
  'polyfillSetImmediate',
  'ExceptionInfo',
  'exception_addRef',
  'exception_decRef',
  'setMainLoop',
  '_setNetworkCallback',
  'heapObjectForWebGLType',
  'heapAccessShiftForWebGLHeap',
  'emscriptenWebGLGet',
  'computeUnpackAlignedImageSize',
  'emscriptenWebGLGetTexPixelData',
  'emscriptenWebGLGetUniform',
  'webglGetUniformLocation',
  'webglPrepareUniformLocationsBeforeFirstUse',
  'webglGetLeftBracePos',
  'emscriptenWebGLGetVertexAttrib',
  'writeGLArray',
  'SDL_unicode',
  'SDL_ttfContext',
  'SDL_audio',
  'GLFW_Window',
  'runAndAbortIfError',
  'ALLOC_NORMAL',
  'ALLOC_STACK',
  'allocate',
];
missingLibrarySymbols.forEach(missingLibrarySymbol)


var calledRun;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

function stackCheckInit() {
  // This is normally called automatically during __wasm_call_ctors but need to
  // get these values before even running any of the ctors so we call it redundantly
  // here.
  _emscripten_stack_init();
  // TODO(sbc): Move writeStackCookie to native to to avoid this.
  writeStackCookie();
}

/** @type {function(Array=)} */
function run(args) {
  args = args || arguments_;

  if (runDependencies > 0) {
    return;
  }

    stackCheckInit();

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    assert(!Module['_main'], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
  checkStackCookie();
}

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = (x) => {
    has = true;
  }
  try { // it doesn't matter if it fails
    _fflush(0);
    // also flush in the JS FS layer
    ['stdout', 'stderr'].forEach(function(name) {
      var info = FS.analyzePath('/dev/' + name);
      if (!info) return;
      var stream = info.object;
      var rdev = stream.rdev;
      var tty = TTY.ttys[rdev];
      if (tty && tty.output && tty.output.length) {
        has = true;
      }
    });
  } catch(e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.');
  }
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

run();






// Bindings utilities

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function WrapperObject() {
}
WrapperObject.prototype = Object.create(WrapperObject.prototype);
WrapperObject.prototype.constructor = WrapperObject;
WrapperObject.prototype.__class__ = WrapperObject;
WrapperObject.__cache__ = {};
Module['WrapperObject'] = WrapperObject;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant)
    @param {*=} __class__ */
function getCache(__class__) {
  return (__class__ || WrapperObject).__cache__;
}
Module['getCache'] = getCache;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant)
    @param {*=} __class__ */
function wrapPointer(ptr, __class__) {
  var cache = getCache(__class__);
  var ret = cache[ptr];
  if (ret) return ret;
  ret = Object.create((__class__ || WrapperObject).prototype);
  ret.ptr = ptr;
  return cache[ptr] = ret;
}
Module['wrapPointer'] = wrapPointer;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function castObject(obj, __class__) {
  return wrapPointer(obj.ptr, __class__);
}
Module['castObject'] = castObject;

Module['NULL'] = wrapPointer(0);

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function destroy(obj) {
  if (!obj['__destroy__']) throw 'Error: Cannot destroy object. (Did you create it yourself?)';
  obj['__destroy__']();
  // Remove from cache, so the object can be GC'd and refs added onto it released
  delete getCache(obj.__class__)[obj.ptr];
}
Module['destroy'] = destroy;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function compare(obj1, obj2) {
  return obj1.ptr === obj2.ptr;
}
Module['compare'] = compare;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function getPointer(obj) {
  return obj.ptr;
}
Module['getPointer'] = getPointer;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function getClass(obj) {
  return obj.__class__;
}
Module['getClass'] = getClass;

// Converts big (string or array) values into a C-style storage, in temporary space

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
var ensureCache = {
  buffer: 0,  // the main buffer of temporary storage
  size: 0,   // the size of buffer
  pos: 0,    // the next free offset in buffer
  temps: [], // extra allocations
  needed: 0, // the total size we need next time

  prepare: function() {
    if (ensureCache.needed) {
      // clear the temps
      for (var i = 0; i < ensureCache.temps.length; i++) {
        Module['_free'](ensureCache.temps[i]);
      }
      ensureCache.temps.length = 0;
      // prepare to allocate a bigger buffer
      Module['_free'](ensureCache.buffer);
      ensureCache.buffer = 0;
      ensureCache.size += ensureCache.needed;
      // clean up
      ensureCache.needed = 0;
    }
    if (!ensureCache.buffer) { // happens first time, or when we need to grow
      ensureCache.size += 128; // heuristic, avoid many small grow events
      ensureCache.buffer = Module['_malloc'](ensureCache.size);
      assert(ensureCache.buffer);
    }
    ensureCache.pos = 0;
  },
  alloc: function(array, view) {
    assert(ensureCache.buffer);
    var bytes = view.BYTES_PER_ELEMENT;
    var len = array.length * bytes;
    len = (len + 7) & -8; // keep things aligned to 8 byte boundaries
    var ret;
    if (ensureCache.pos + len >= ensureCache.size) {
      // we failed to allocate in the buffer, ensureCache time around :(
      assert(len > 0); // null terminator, at least
      ensureCache.needed += len;
      ret = Module['_malloc'](len);
      ensureCache.temps.push(ret);
    } else {
      // we can allocate in the buffer
      ret = ensureCache.buffer + ensureCache.pos;
      ensureCache.pos += len;
    }
    return ret;
  },
  copy: function(array, view, offset) {
    offset >>>= 0;
    var bytes = view.BYTES_PER_ELEMENT;
    switch (bytes) {
      case 2: offset >>>= 1; break;
      case 4: offset >>>= 2; break;
      case 8: offset >>>= 3; break;
    }
    for (var i = 0; i < array.length; i++) {
      view[offset + i] = array[i];
    }
  },
};

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureString(value) {
  if (typeof value === 'string') {
    var intArray = intArrayFromString(value);
    var offset = ensureCache.alloc(intArray, HEAP8);
    ensureCache.copy(intArray, HEAP8, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureInt8(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP8);
    ensureCache.copy(value, HEAP8, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureInt16(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP16);
    ensureCache.copy(value, HEAP16, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureInt32(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP32);
    ensureCache.copy(value, HEAP32, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureFloat32(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAPF32);
    ensureCache.copy(value, HEAPF32, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureFloat64(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAPF64);
    ensureCache.copy(value, HEAPF64, offset);
    return offset;
  }
  return value;
}


// b2ContactListener
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2ContactListener() { throw "cannot construct a b2ContactListener, no constructor in IDL" }
b2ContactListener.prototype = Object.create(WrapperObject.prototype);
b2ContactListener.prototype.constructor = b2ContactListener;
b2ContactListener.prototype.__class__ = b2ContactListener;
b2ContactListener.__cache__ = {};
Module['b2ContactListener'] = b2ContactListener;

  b2ContactListener.prototype['__destroy__'] = b2ContactListener.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2ContactListener___destroy___0(self);
};
// b2Shape
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Shape() { throw "cannot construct a b2Shape, no constructor in IDL" }
b2Shape.prototype = Object.create(WrapperObject.prototype);
b2Shape.prototype.constructor = b2Shape;
b2Shape.prototype.__class__ = b2Shape;
b2Shape.__cache__ = {};
Module['b2Shape'] = b2Shape;

b2Shape.prototype['GetType'] = b2Shape.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Shape_GetType_0(self);
};;

b2Shape.prototype['GetChildCount'] = b2Shape.prototype.GetChildCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Shape_GetChildCount_0(self);
};;

b2Shape.prototype['TestPoint'] = b2Shape.prototype.TestPoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(xf, p) {
  var self = this.ptr;
  if (xf && typeof xf === 'object') xf = xf.ptr;
  if (p && typeof p === 'object') p = p.ptr;
  return !!(_emscripten_bind_b2Shape_TestPoint_2(self, xf, p));
};;

b2Shape.prototype['RayCast'] = b2Shape.prototype.RayCast = /** @suppress {undefinedVars, duplicate} @this{Object} */function(output, input, transform, childIndex) {
  var self = this.ptr;
  if (output && typeof output === 'object') output = output.ptr;
  if (input && typeof input === 'object') input = input.ptr;
  if (transform && typeof transform === 'object') transform = transform.ptr;
  if (childIndex && typeof childIndex === 'object') childIndex = childIndex.ptr;
  return !!(_emscripten_bind_b2Shape_RayCast_4(self, output, input, transform, childIndex));
};;

b2Shape.prototype['ComputeAABB'] = b2Shape.prototype.ComputeAABB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(aabb, xf, childIndex) {
  var self = this.ptr;
  if (aabb && typeof aabb === 'object') aabb = aabb.ptr;
  if (xf && typeof xf === 'object') xf = xf.ptr;
  if (childIndex && typeof childIndex === 'object') childIndex = childIndex.ptr;
  _emscripten_bind_b2Shape_ComputeAABB_3(self, aabb, xf, childIndex);
};;

b2Shape.prototype['ComputeMass'] = b2Shape.prototype.ComputeMass = /** @suppress {undefinedVars, duplicate} @this{Object} */function(massData, density) {
  var self = this.ptr;
  if (massData && typeof massData === 'object') massData = massData.ptr;
  if (density && typeof density === 'object') density = density.ptr;
  _emscripten_bind_b2Shape_ComputeMass_2(self, massData, density);
};;

  b2Shape.prototype['get_m_type'] = b2Shape.prototype.get_m_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Shape_get_m_type_0(self);
};
    b2Shape.prototype['set_m_type'] = b2Shape.prototype.set_m_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Shape_set_m_type_1(self, arg0);
};
    Object.defineProperty(b2Shape.prototype, 'm_type', { get: b2Shape.prototype.get_m_type, set: b2Shape.prototype.set_m_type });
  b2Shape.prototype['get_m_radius'] = b2Shape.prototype.get_m_radius = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Shape_get_m_radius_0(self);
};
    b2Shape.prototype['set_m_radius'] = b2Shape.prototype.set_m_radius = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Shape_set_m_radius_1(self, arg0);
};
    Object.defineProperty(b2Shape.prototype, 'm_radius', { get: b2Shape.prototype.get_m_radius, set: b2Shape.prototype.set_m_radius });
  b2Shape.prototype['__destroy__'] = b2Shape.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Shape___destroy___0(self);
};
// b2RayCastCallback
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2RayCastCallback() { throw "cannot construct a b2RayCastCallback, no constructor in IDL" }
b2RayCastCallback.prototype = Object.create(WrapperObject.prototype);
b2RayCastCallback.prototype.constructor = b2RayCastCallback;
b2RayCastCallback.prototype.__class__ = b2RayCastCallback;
b2RayCastCallback.__cache__ = {};
Module['b2RayCastCallback'] = b2RayCastCallback;

  b2RayCastCallback.prototype['__destroy__'] = b2RayCastCallback.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2RayCastCallback___destroy___0(self);
};
// b2QueryCallback
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2QueryCallback() { throw "cannot construct a b2QueryCallback, no constructor in IDL" }
b2QueryCallback.prototype = Object.create(WrapperObject.prototype);
b2QueryCallback.prototype.constructor = b2QueryCallback;
b2QueryCallback.prototype.__class__ = b2QueryCallback;
b2QueryCallback.__cache__ = {};
Module['b2QueryCallback'] = b2QueryCallback;

  b2QueryCallback.prototype['__destroy__'] = b2QueryCallback.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2QueryCallback___destroy___0(self);
};
// b2JointDef
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2JointDef() {
  this.ptr = _emscripten_bind_b2JointDef_b2JointDef_0();
  getCache(b2JointDef)[this.ptr] = this;
};;
b2JointDef.prototype = Object.create(WrapperObject.prototype);
b2JointDef.prototype.constructor = b2JointDef;
b2JointDef.prototype.__class__ = b2JointDef;
b2JointDef.__cache__ = {};
Module['b2JointDef'] = b2JointDef;

  b2JointDef.prototype['get_type'] = b2JointDef.prototype.get_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2JointDef_get_type_0(self);
};
    b2JointDef.prototype['set_type'] = b2JointDef.prototype.set_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2JointDef_set_type_1(self, arg0);
};
    Object.defineProperty(b2JointDef.prototype, 'type', { get: b2JointDef.prototype.get_type, set: b2JointDef.prototype.set_type });
  b2JointDef.prototype['get_userData'] = b2JointDef.prototype.get_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2JointDef_get_userData_0(self), b2JointUserData);
};
    b2JointDef.prototype['set_userData'] = b2JointDef.prototype.set_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2JointDef_set_userData_1(self, arg0);
};
    Object.defineProperty(b2JointDef.prototype, 'userData', { get: b2JointDef.prototype.get_userData, set: b2JointDef.prototype.set_userData });
  b2JointDef.prototype['get_bodyA'] = b2JointDef.prototype.get_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2JointDef_get_bodyA_0(self), b2Body);
};
    b2JointDef.prototype['set_bodyA'] = b2JointDef.prototype.set_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2JointDef_set_bodyA_1(self, arg0);
};
    Object.defineProperty(b2JointDef.prototype, 'bodyA', { get: b2JointDef.prototype.get_bodyA, set: b2JointDef.prototype.set_bodyA });
  b2JointDef.prototype['get_bodyB'] = b2JointDef.prototype.get_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2JointDef_get_bodyB_0(self), b2Body);
};
    b2JointDef.prototype['set_bodyB'] = b2JointDef.prototype.set_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2JointDef_set_bodyB_1(self, arg0);
};
    Object.defineProperty(b2JointDef.prototype, 'bodyB', { get: b2JointDef.prototype.get_bodyB, set: b2JointDef.prototype.set_bodyB });
  b2JointDef.prototype['get_collideConnected'] = b2JointDef.prototype.get_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2JointDef_get_collideConnected_0(self));
};
    b2JointDef.prototype['set_collideConnected'] = b2JointDef.prototype.set_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2JointDef_set_collideConnected_1(self, arg0);
};
    Object.defineProperty(b2JointDef.prototype, 'collideConnected', { get: b2JointDef.prototype.get_collideConnected, set: b2JointDef.prototype.set_collideConnected });
  b2JointDef.prototype['__destroy__'] = b2JointDef.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2JointDef___destroy___0(self);
};
// b2Joint
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Joint() { throw "cannot construct a b2Joint, no constructor in IDL" }
b2Joint.prototype = Object.create(WrapperObject.prototype);
b2Joint.prototype.constructor = b2Joint;
b2Joint.prototype.__class__ = b2Joint;
b2Joint.__cache__ = {};
Module['b2Joint'] = b2Joint;

b2Joint.prototype['GetType'] = b2Joint.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Joint_GetType_0(self);
};;

b2Joint.prototype['GetBodyA'] = b2Joint.prototype.GetBodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Joint_GetBodyA_0(self), b2Body);
};;

b2Joint.prototype['GetBodyB'] = b2Joint.prototype.GetBodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Joint_GetBodyB_0(self), b2Body);
};;

b2Joint.prototype['GetAnchorA'] = b2Joint.prototype.GetAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Joint_GetAnchorA_0(self), b2Vec2);
};;

b2Joint.prototype['GetAnchorB'] = b2Joint.prototype.GetAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Joint_GetAnchorB_0(self), b2Vec2);
};;

b2Joint.prototype['GetReactionForce'] = b2Joint.prototype.GetReactionForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return wrapPointer(_emscripten_bind_b2Joint_GetReactionForce_1(self, inv_dt), b2Vec2);
};;

b2Joint.prototype['GetReactionTorque'] = b2Joint.prototype.GetReactionTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return _emscripten_bind_b2Joint_GetReactionTorque_1(self, inv_dt);
};;

b2Joint.prototype['GetNext'] = b2Joint.prototype.GetNext = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Joint_GetNext_0(self), b2Joint);
};;

b2Joint.prototype['GetUserData'] = b2Joint.prototype.GetUserData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Joint_GetUserData_0(self), b2JointUserData);
};;

b2Joint.prototype['GetCollideConnected'] = b2Joint.prototype.GetCollideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2Joint_GetCollideConnected_0(self));
};;

b2Joint.prototype['Dump'] = b2Joint.prototype.Dump = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Joint_Dump_0(self);
};;

// b2ContactFilter
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2ContactFilter() { throw "cannot construct a b2ContactFilter, no constructor in IDL" }
b2ContactFilter.prototype = Object.create(WrapperObject.prototype);
b2ContactFilter.prototype.constructor = b2ContactFilter;
b2ContactFilter.prototype.__class__ = b2ContactFilter;
b2ContactFilter.__cache__ = {};
Module['b2ContactFilter'] = b2ContactFilter;

  b2ContactFilter.prototype['__destroy__'] = b2ContactFilter.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2ContactFilter___destroy___0(self);
};
// b2DestructionListenerWrapper
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2DestructionListenerWrapper() { throw "cannot construct a b2DestructionListenerWrapper, no constructor in IDL" }
b2DestructionListenerWrapper.prototype = Object.create(WrapperObject.prototype);
b2DestructionListenerWrapper.prototype.constructor = b2DestructionListenerWrapper;
b2DestructionListenerWrapper.prototype.__class__ = b2DestructionListenerWrapper;
b2DestructionListenerWrapper.__cache__ = {};
Module['b2DestructionListenerWrapper'] = b2DestructionListenerWrapper;

  b2DestructionListenerWrapper.prototype['__destroy__'] = b2DestructionListenerWrapper.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2DestructionListenerWrapper___destroy___0(self);
};
// b2Draw
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Draw() { throw "cannot construct a b2Draw, no constructor in IDL" }
b2Draw.prototype = Object.create(WrapperObject.prototype);
b2Draw.prototype.constructor = b2Draw;
b2Draw.prototype.__class__ = b2Draw;
b2Draw.__cache__ = {};
Module['b2Draw'] = b2Draw;

b2Draw.prototype['SetFlags'] = b2Draw.prototype.SetFlags = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flags) {
  var self = this.ptr;
  if (flags && typeof flags === 'object') flags = flags.ptr;
  _emscripten_bind_b2Draw_SetFlags_1(self, flags);
};;

b2Draw.prototype['GetFlags'] = b2Draw.prototype.GetFlags = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Draw_GetFlags_0(self);
};;

b2Draw.prototype['AppendFlags'] = b2Draw.prototype.AppendFlags = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flags) {
  var self = this.ptr;
  if (flags && typeof flags === 'object') flags = flags.ptr;
  _emscripten_bind_b2Draw_AppendFlags_1(self, flags);
};;

b2Draw.prototype['ClearFlags'] = b2Draw.prototype.ClearFlags = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flags) {
  var self = this.ptr;
  if (flags && typeof flags === 'object') flags = flags.ptr;
  _emscripten_bind_b2Draw_ClearFlags_1(self, flags);
};;

  b2Draw.prototype['__destroy__'] = b2Draw.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Draw___destroy___0(self);
};
// VoidPtr
/** @suppress {undefinedVars, duplicate} @this{Object} */function VoidPtr() { throw "cannot construct a VoidPtr, no constructor in IDL" }
VoidPtr.prototype = Object.create(WrapperObject.prototype);
VoidPtr.prototype.constructor = VoidPtr;
VoidPtr.prototype.__class__ = VoidPtr;
VoidPtr.__cache__ = {};
Module['VoidPtr'] = VoidPtr;

  VoidPtr.prototype['__destroy__'] = VoidPtr.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_VoidPtr___destroy___0(self);
};
// b2Contact
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Contact() { throw "cannot construct a b2Contact, no constructor in IDL" }
b2Contact.prototype = Object.create(WrapperObject.prototype);
b2Contact.prototype.constructor = b2Contact;
b2Contact.prototype.__class__ = b2Contact;
b2Contact.__cache__ = {};
Module['b2Contact'] = b2Contact;

b2Contact.prototype['GetManifold'] = b2Contact.prototype.GetManifold = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Contact_GetManifold_0(self), b2Manifold);
};;

b2Contact.prototype['GetWorldManifold'] = b2Contact.prototype.GetWorldManifold = /** @suppress {undefinedVars, duplicate} @this{Object} */function(manifold) {
  var self = this.ptr;
  if (manifold && typeof manifold === 'object') manifold = manifold.ptr;
  _emscripten_bind_b2Contact_GetWorldManifold_1(self, manifold);
};;

b2Contact.prototype['IsTouching'] = b2Contact.prototype.IsTouching = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2Contact_IsTouching_0(self));
};;

b2Contact.prototype['SetEnabled'] = b2Contact.prototype.SetEnabled = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2Contact_SetEnabled_1(self, flag);
};;

b2Contact.prototype['IsEnabled'] = b2Contact.prototype.IsEnabled = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2Contact_IsEnabled_0(self));
};;

b2Contact.prototype['GetNext'] = b2Contact.prototype.GetNext = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Contact_GetNext_0(self), b2Contact);
};;

b2Contact.prototype['GetFixtureA'] = b2Contact.prototype.GetFixtureA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Contact_GetFixtureA_0(self), b2Fixture);
};;

b2Contact.prototype['GetChildIndexA'] = b2Contact.prototype.GetChildIndexA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Contact_GetChildIndexA_0(self);
};;

b2Contact.prototype['GetFixtureB'] = b2Contact.prototype.GetFixtureB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Contact_GetFixtureB_0(self), b2Fixture);
};;

b2Contact.prototype['GetChildIndexB'] = b2Contact.prototype.GetChildIndexB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Contact_GetChildIndexB_0(self);
};;

b2Contact.prototype['SetFriction'] = b2Contact.prototype.SetFriction = /** @suppress {undefinedVars, duplicate} @this{Object} */function(friction) {
  var self = this.ptr;
  if (friction && typeof friction === 'object') friction = friction.ptr;
  _emscripten_bind_b2Contact_SetFriction_1(self, friction);
};;

b2Contact.prototype['GetFriction'] = b2Contact.prototype.GetFriction = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Contact_GetFriction_0(self);
};;

b2Contact.prototype['ResetFriction'] = b2Contact.prototype.ResetFriction = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Contact_ResetFriction_0(self);
};;

b2Contact.prototype['SetRestitution'] = b2Contact.prototype.SetRestitution = /** @suppress {undefinedVars, duplicate} @this{Object} */function(restitution) {
  var self = this.ptr;
  if (restitution && typeof restitution === 'object') restitution = restitution.ptr;
  _emscripten_bind_b2Contact_SetRestitution_1(self, restitution);
};;

b2Contact.prototype['GetRestitution'] = b2Contact.prototype.GetRestitution = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Contact_GetRestitution_0(self);
};;

b2Contact.prototype['ResetRestitution'] = b2Contact.prototype.ResetRestitution = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Contact_ResetRestitution_0(self);
};;

b2Contact.prototype['SetRestitutionThreshold'] = b2Contact.prototype.SetRestitutionThreshold = /** @suppress {undefinedVars, duplicate} @this{Object} */function(threshold) {
  var self = this.ptr;
  if (threshold && typeof threshold === 'object') threshold = threshold.ptr;
  _emscripten_bind_b2Contact_SetRestitutionThreshold_1(self, threshold);
};;

b2Contact.prototype['GetRestitutionThreshold'] = b2Contact.prototype.GetRestitutionThreshold = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Contact_GetRestitutionThreshold_0(self);
};;

b2Contact.prototype['ResetRestitutionThreshold'] = b2Contact.prototype.ResetRestitutionThreshold = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Contact_ResetRestitutionThreshold_0(self);
};;

b2Contact.prototype['SetTangentSpeed'] = b2Contact.prototype.SetTangentSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function(speed) {
  var self = this.ptr;
  if (speed && typeof speed === 'object') speed = speed.ptr;
  _emscripten_bind_b2Contact_SetTangentSpeed_1(self, speed);
};;

b2Contact.prototype['GetTangentSpeed'] = b2Contact.prototype.GetTangentSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Contact_GetTangentSpeed_0(self);
};;

// JSContactListener
/** @suppress {undefinedVars, duplicate} @this{Object} */function JSContactListener() {
  this.ptr = _emscripten_bind_JSContactListener_JSContactListener_0();
  getCache(JSContactListener)[this.ptr] = this;
};;
JSContactListener.prototype = Object.create(b2ContactListener.prototype);
JSContactListener.prototype.constructor = JSContactListener;
JSContactListener.prototype.__class__ = JSContactListener;
JSContactListener.__cache__ = {};
Module['JSContactListener'] = JSContactListener;

JSContactListener.prototype['BeginContact'] = JSContactListener.prototype.BeginContact = /** @suppress {undefinedVars, duplicate} @this{Object} */function(contact) {
  var self = this.ptr;
  if (contact && typeof contact === 'object') contact = contact.ptr;
  _emscripten_bind_JSContactListener_BeginContact_1(self, contact);
};;

JSContactListener.prototype['EndContact'] = JSContactListener.prototype.EndContact = /** @suppress {undefinedVars, duplicate} @this{Object} */function(contact) {
  var self = this.ptr;
  if (contact && typeof contact === 'object') contact = contact.ptr;
  _emscripten_bind_JSContactListener_EndContact_1(self, contact);
};;

JSContactListener.prototype['PreSolve'] = JSContactListener.prototype.PreSolve = /** @suppress {undefinedVars, duplicate} @this{Object} */function(contact, oldManifold) {
  var self = this.ptr;
  if (contact && typeof contact === 'object') contact = contact.ptr;
  if (oldManifold && typeof oldManifold === 'object') oldManifold = oldManifold.ptr;
  _emscripten_bind_JSContactListener_PreSolve_2(self, contact, oldManifold);
};;

JSContactListener.prototype['PostSolve'] = JSContactListener.prototype.PostSolve = /** @suppress {undefinedVars, duplicate} @this{Object} */function(contact, impulse) {
  var self = this.ptr;
  if (contact && typeof contact === 'object') contact = contact.ptr;
  if (impulse && typeof impulse === 'object') impulse = impulse.ptr;
  _emscripten_bind_JSContactListener_PostSolve_2(self, contact, impulse);
};;

  JSContactListener.prototype['__destroy__'] = JSContactListener.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_JSContactListener___destroy___0(self);
};
// b2World
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2World(gravity) {
  if (gravity && typeof gravity === 'object') gravity = gravity.ptr;
  this.ptr = _emscripten_bind_b2World_b2World_1(gravity);
  getCache(b2World)[this.ptr] = this;
};;
b2World.prototype = Object.create(WrapperObject.prototype);
b2World.prototype.constructor = b2World;
b2World.prototype.__class__ = b2World;
b2World.__cache__ = {};
Module['b2World'] = b2World;

b2World.prototype['SetDestructionListener'] = b2World.prototype.SetDestructionListener = /** @suppress {undefinedVars, duplicate} @this{Object} */function(listener) {
  var self = this.ptr;
  if (listener && typeof listener === 'object') listener = listener.ptr;
  _emscripten_bind_b2World_SetDestructionListener_1(self, listener);
};;

b2World.prototype['SetContactFilter'] = b2World.prototype.SetContactFilter = /** @suppress {undefinedVars, duplicate} @this{Object} */function(filter) {
  var self = this.ptr;
  if (filter && typeof filter === 'object') filter = filter.ptr;
  _emscripten_bind_b2World_SetContactFilter_1(self, filter);
};;

b2World.prototype['SetContactListener'] = b2World.prototype.SetContactListener = /** @suppress {undefinedVars, duplicate} @this{Object} */function(listener) {
  var self = this.ptr;
  if (listener && typeof listener === 'object') listener = listener.ptr;
  _emscripten_bind_b2World_SetContactListener_1(self, listener);
};;

b2World.prototype['SetDebugDraw'] = b2World.prototype.SetDebugDraw = /** @suppress {undefinedVars, duplicate} @this{Object} */function(debugDraw) {
  var self = this.ptr;
  if (debugDraw && typeof debugDraw === 'object') debugDraw = debugDraw.ptr;
  _emscripten_bind_b2World_SetDebugDraw_1(self, debugDraw);
};;

b2World.prototype['CreateBody'] = b2World.prototype.CreateBody = /** @suppress {undefinedVars, duplicate} @this{Object} */function(def) {
  var self = this.ptr;
  if (def && typeof def === 'object') def = def.ptr;
  return wrapPointer(_emscripten_bind_b2World_CreateBody_1(self, def), b2Body);
};;

b2World.prototype['DestroyBody'] = b2World.prototype.DestroyBody = /** @suppress {undefinedVars, duplicate} @this{Object} */function(body) {
  var self = this.ptr;
  if (body && typeof body === 'object') body = body.ptr;
  _emscripten_bind_b2World_DestroyBody_1(self, body);
};;

b2World.prototype['CreateJoint'] = b2World.prototype.CreateJoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(def) {
  var self = this.ptr;
  if (def && typeof def === 'object') def = def.ptr;
  return wrapPointer(_emscripten_bind_b2World_CreateJoint_1(self, def), b2Joint);
};;

b2World.prototype['DestroyJoint'] = b2World.prototype.DestroyJoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(joint) {
  var self = this.ptr;
  if (joint && typeof joint === 'object') joint = joint.ptr;
  _emscripten_bind_b2World_DestroyJoint_1(self, joint);
};;

b2World.prototype['Step'] = b2World.prototype.Step = /** @suppress {undefinedVars, duplicate} @this{Object} */function(timeStep, velocityIterations, positionIterations) {
  var self = this.ptr;
  if (timeStep && typeof timeStep === 'object') timeStep = timeStep.ptr;
  if (velocityIterations && typeof velocityIterations === 'object') velocityIterations = velocityIterations.ptr;
  if (positionIterations && typeof positionIterations === 'object') positionIterations = positionIterations.ptr;
  _emscripten_bind_b2World_Step_3(self, timeStep, velocityIterations, positionIterations);
};;

b2World.prototype['ClearForces'] = b2World.prototype.ClearForces = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2World_ClearForces_0(self);
};;

b2World.prototype['DebugDraw'] = b2World.prototype.DebugDraw = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2World_DebugDraw_0(self);
};;

b2World.prototype['QueryAABB'] = b2World.prototype.QueryAABB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(callback, aabb) {
  var self = this.ptr;
  if (callback && typeof callback === 'object') callback = callback.ptr;
  if (aabb && typeof aabb === 'object') aabb = aabb.ptr;
  _emscripten_bind_b2World_QueryAABB_2(self, callback, aabb);
};;

b2World.prototype['RayCast'] = b2World.prototype.RayCast = /** @suppress {undefinedVars, duplicate} @this{Object} */function(callback, point1, point2) {
  var self = this.ptr;
  if (callback && typeof callback === 'object') callback = callback.ptr;
  if (point1 && typeof point1 === 'object') point1 = point1.ptr;
  if (point2 && typeof point2 === 'object') point2 = point2.ptr;
  _emscripten_bind_b2World_RayCast_3(self, callback, point1, point2);
};;

b2World.prototype['GetBodyList'] = b2World.prototype.GetBodyList = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2World_GetBodyList_0(self), b2Body);
};;

b2World.prototype['GetJointList'] = b2World.prototype.GetJointList = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2World_GetJointList_0(self), b2Joint);
};;

b2World.prototype['GetContactList'] = b2World.prototype.GetContactList = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2World_GetContactList_0(self), b2Contact);
};;

b2World.prototype['SetAllowSleeping'] = b2World.prototype.SetAllowSleeping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2World_SetAllowSleeping_1(self, flag);
};;

b2World.prototype['GetAllowSleeping'] = b2World.prototype.GetAllowSleeping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2World_GetAllowSleeping_0(self));
};;

b2World.prototype['SetWarmStarting'] = b2World.prototype.SetWarmStarting = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2World_SetWarmStarting_1(self, flag);
};;

b2World.prototype['GetWarmStarting'] = b2World.prototype.GetWarmStarting = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2World_GetWarmStarting_0(self));
};;

b2World.prototype['SetContinuousPhysics'] = b2World.prototype.SetContinuousPhysics = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2World_SetContinuousPhysics_1(self, flag);
};;

b2World.prototype['GetContinuousPhysics'] = b2World.prototype.GetContinuousPhysics = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2World_GetContinuousPhysics_0(self));
};;

b2World.prototype['SetSubStepping'] = b2World.prototype.SetSubStepping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2World_SetSubStepping_1(self, flag);
};;

b2World.prototype['GetSubStepping'] = b2World.prototype.GetSubStepping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2World_GetSubStepping_0(self));
};;

b2World.prototype['GetProxyCount'] = b2World.prototype.GetProxyCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2World_GetProxyCount_0(self);
};;

b2World.prototype['GetBodyCount'] = b2World.prototype.GetBodyCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2World_GetBodyCount_0(self);
};;

b2World.prototype['GetJointCount'] = b2World.prototype.GetJointCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2World_GetJointCount_0(self);
};;

b2World.prototype['GetContactCount'] = b2World.prototype.GetContactCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2World_GetContactCount_0(self);
};;

b2World.prototype['GetTreeHeight'] = b2World.prototype.GetTreeHeight = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2World_GetTreeHeight_0(self);
};;

b2World.prototype['GetTreeBalance'] = b2World.prototype.GetTreeBalance = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2World_GetTreeBalance_0(self);
};;

b2World.prototype['GetTreeQuality'] = b2World.prototype.GetTreeQuality = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2World_GetTreeQuality_0(self);
};;

b2World.prototype['SetGravity'] = b2World.prototype.SetGravity = /** @suppress {undefinedVars, duplicate} @this{Object} */function(gravity) {
  var self = this.ptr;
  if (gravity && typeof gravity === 'object') gravity = gravity.ptr;
  _emscripten_bind_b2World_SetGravity_1(self, gravity);
};;

b2World.prototype['GetGravity'] = b2World.prototype.GetGravity = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2World_GetGravity_0(self), b2Vec2);
};;

b2World.prototype['IsLocked'] = b2World.prototype.IsLocked = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2World_IsLocked_0(self));
};;

b2World.prototype['SetAutoClearForces'] = b2World.prototype.SetAutoClearForces = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2World_SetAutoClearForces_1(self, flag);
};;

b2World.prototype['GetAutoClearForces'] = b2World.prototype.GetAutoClearForces = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2World_GetAutoClearForces_0(self));
};;

b2World.prototype['GetProfile'] = b2World.prototype.GetProfile = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2World_GetProfile_0(self), b2Profile);
};;

b2World.prototype['Dump'] = b2World.prototype.Dump = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2World_Dump_0(self);
};;

  b2World.prototype['__destroy__'] = b2World.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2World___destroy___0(self);
};
// b2FixtureUserData
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2FixtureUserData() { throw "cannot construct a b2FixtureUserData, no constructor in IDL" }
b2FixtureUserData.prototype = Object.create(WrapperObject.prototype);
b2FixtureUserData.prototype.constructor = b2FixtureUserData;
b2FixtureUserData.prototype.__class__ = b2FixtureUserData;
b2FixtureUserData.__cache__ = {};
Module['b2FixtureUserData'] = b2FixtureUserData;

  b2FixtureUserData.prototype['get_pointer'] = b2FixtureUserData.prototype.get_pointer = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2FixtureUserData_get_pointer_0(self);
};
    b2FixtureUserData.prototype['set_pointer'] = b2FixtureUserData.prototype.set_pointer = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FixtureUserData_set_pointer_1(self, arg0);
};
    Object.defineProperty(b2FixtureUserData.prototype, 'pointer', { get: b2FixtureUserData.prototype.get_pointer, set: b2FixtureUserData.prototype.set_pointer });
  b2FixtureUserData.prototype['__destroy__'] = b2FixtureUserData.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2FixtureUserData___destroy___0(self);
};
// b2FixtureDef
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2FixtureDef() {
  this.ptr = _emscripten_bind_b2FixtureDef_b2FixtureDef_0();
  getCache(b2FixtureDef)[this.ptr] = this;
};;
b2FixtureDef.prototype = Object.create(WrapperObject.prototype);
b2FixtureDef.prototype.constructor = b2FixtureDef;
b2FixtureDef.prototype.__class__ = b2FixtureDef;
b2FixtureDef.__cache__ = {};
Module['b2FixtureDef'] = b2FixtureDef;

  b2FixtureDef.prototype['get_shape'] = b2FixtureDef.prototype.get_shape = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2FixtureDef_get_shape_0(self), b2Shape);
};
    b2FixtureDef.prototype['set_shape'] = b2FixtureDef.prototype.set_shape = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FixtureDef_set_shape_1(self, arg0);
};
    Object.defineProperty(b2FixtureDef.prototype, 'shape', { get: b2FixtureDef.prototype.get_shape, set: b2FixtureDef.prototype.set_shape });
  b2FixtureDef.prototype['get_userData'] = b2FixtureDef.prototype.get_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2FixtureDef_get_userData_0(self), b2FixtureUserData);
};
    b2FixtureDef.prototype['set_userData'] = b2FixtureDef.prototype.set_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FixtureDef_set_userData_1(self, arg0);
};
    Object.defineProperty(b2FixtureDef.prototype, 'userData', { get: b2FixtureDef.prototype.get_userData, set: b2FixtureDef.prototype.set_userData });
  b2FixtureDef.prototype['get_friction'] = b2FixtureDef.prototype.get_friction = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2FixtureDef_get_friction_0(self);
};
    b2FixtureDef.prototype['set_friction'] = b2FixtureDef.prototype.set_friction = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FixtureDef_set_friction_1(self, arg0);
};
    Object.defineProperty(b2FixtureDef.prototype, 'friction', { get: b2FixtureDef.prototype.get_friction, set: b2FixtureDef.prototype.set_friction });
  b2FixtureDef.prototype['get_restitution'] = b2FixtureDef.prototype.get_restitution = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2FixtureDef_get_restitution_0(self);
};
    b2FixtureDef.prototype['set_restitution'] = b2FixtureDef.prototype.set_restitution = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FixtureDef_set_restitution_1(self, arg0);
};
    Object.defineProperty(b2FixtureDef.prototype, 'restitution', { get: b2FixtureDef.prototype.get_restitution, set: b2FixtureDef.prototype.set_restitution });
  b2FixtureDef.prototype['get_restitutionThreshold'] = b2FixtureDef.prototype.get_restitutionThreshold = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2FixtureDef_get_restitutionThreshold_0(self);
};
    b2FixtureDef.prototype['set_restitutionThreshold'] = b2FixtureDef.prototype.set_restitutionThreshold = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FixtureDef_set_restitutionThreshold_1(self, arg0);
};
    Object.defineProperty(b2FixtureDef.prototype, 'restitutionThreshold', { get: b2FixtureDef.prototype.get_restitutionThreshold, set: b2FixtureDef.prototype.set_restitutionThreshold });
  b2FixtureDef.prototype['get_density'] = b2FixtureDef.prototype.get_density = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2FixtureDef_get_density_0(self);
};
    b2FixtureDef.prototype['set_density'] = b2FixtureDef.prototype.set_density = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FixtureDef_set_density_1(self, arg0);
};
    Object.defineProperty(b2FixtureDef.prototype, 'density', { get: b2FixtureDef.prototype.get_density, set: b2FixtureDef.prototype.set_density });
  b2FixtureDef.prototype['get_isSensor'] = b2FixtureDef.prototype.get_isSensor = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2FixtureDef_get_isSensor_0(self));
};
    b2FixtureDef.prototype['set_isSensor'] = b2FixtureDef.prototype.set_isSensor = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FixtureDef_set_isSensor_1(self, arg0);
};
    Object.defineProperty(b2FixtureDef.prototype, 'isSensor', { get: b2FixtureDef.prototype.get_isSensor, set: b2FixtureDef.prototype.set_isSensor });
  b2FixtureDef.prototype['get_filter'] = b2FixtureDef.prototype.get_filter = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2FixtureDef_get_filter_0(self), b2Filter);
};
    b2FixtureDef.prototype['set_filter'] = b2FixtureDef.prototype.set_filter = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FixtureDef_set_filter_1(self, arg0);
};
    Object.defineProperty(b2FixtureDef.prototype, 'filter', { get: b2FixtureDef.prototype.get_filter, set: b2FixtureDef.prototype.set_filter });
  b2FixtureDef.prototype['__destroy__'] = b2FixtureDef.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2FixtureDef___destroy___0(self);
};
// b2Fixture
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Fixture() { throw "cannot construct a b2Fixture, no constructor in IDL" }
b2Fixture.prototype = Object.create(WrapperObject.prototype);
b2Fixture.prototype.constructor = b2Fixture;
b2Fixture.prototype.__class__ = b2Fixture;
b2Fixture.__cache__ = {};
Module['b2Fixture'] = b2Fixture;

b2Fixture.prototype['GetType'] = b2Fixture.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Fixture_GetType_0(self);
};;

b2Fixture.prototype['GetShape'] = b2Fixture.prototype.GetShape = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Fixture_GetShape_0(self), b2Shape);
};;

b2Fixture.prototype['SetSensor'] = b2Fixture.prototype.SetSensor = /** @suppress {undefinedVars, duplicate} @this{Object} */function(sensor) {
  var self = this.ptr;
  if (sensor && typeof sensor === 'object') sensor = sensor.ptr;
  _emscripten_bind_b2Fixture_SetSensor_1(self, sensor);
};;

b2Fixture.prototype['IsSensor'] = b2Fixture.prototype.IsSensor = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2Fixture_IsSensor_0(self));
};;

b2Fixture.prototype['SetFilterData'] = b2Fixture.prototype.SetFilterData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(filter) {
  var self = this.ptr;
  if (filter && typeof filter === 'object') filter = filter.ptr;
  _emscripten_bind_b2Fixture_SetFilterData_1(self, filter);
};;

b2Fixture.prototype['GetFilterData'] = b2Fixture.prototype.GetFilterData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Fixture_GetFilterData_0(self), b2Filter);
};;

b2Fixture.prototype['Refilter'] = b2Fixture.prototype.Refilter = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Fixture_Refilter_0(self);
};;

b2Fixture.prototype['GetBody'] = b2Fixture.prototype.GetBody = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Fixture_GetBody_0(self), b2Body);
};;

b2Fixture.prototype['GetNext'] = b2Fixture.prototype.GetNext = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Fixture_GetNext_0(self), b2Fixture);
};;

b2Fixture.prototype['GetUserData'] = b2Fixture.prototype.GetUserData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Fixture_GetUserData_0(self), b2FixtureUserData);
};;

b2Fixture.prototype['TestPoint'] = b2Fixture.prototype.TestPoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(p) {
  var self = this.ptr;
  if (p && typeof p === 'object') p = p.ptr;
  return !!(_emscripten_bind_b2Fixture_TestPoint_1(self, p));
};;

b2Fixture.prototype['RayCast'] = b2Fixture.prototype.RayCast = /** @suppress {undefinedVars, duplicate} @this{Object} */function(output, input, childIndex) {
  var self = this.ptr;
  if (output && typeof output === 'object') output = output.ptr;
  if (input && typeof input === 'object') input = input.ptr;
  if (childIndex && typeof childIndex === 'object') childIndex = childIndex.ptr;
  return !!(_emscripten_bind_b2Fixture_RayCast_3(self, output, input, childIndex));
};;

b2Fixture.prototype['GetMassData'] = b2Fixture.prototype.GetMassData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(massData) {
  var self = this.ptr;
  if (massData && typeof massData === 'object') massData = massData.ptr;
  _emscripten_bind_b2Fixture_GetMassData_1(self, massData);
};;

b2Fixture.prototype['SetDensity'] = b2Fixture.prototype.SetDensity = /** @suppress {undefinedVars, duplicate} @this{Object} */function(density) {
  var self = this.ptr;
  if (density && typeof density === 'object') density = density.ptr;
  _emscripten_bind_b2Fixture_SetDensity_1(self, density);
};;

b2Fixture.prototype['GetDensity'] = b2Fixture.prototype.GetDensity = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Fixture_GetDensity_0(self);
};;

b2Fixture.prototype['GetFriction'] = b2Fixture.prototype.GetFriction = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Fixture_GetFriction_0(self);
};;

b2Fixture.prototype['SetFriction'] = b2Fixture.prototype.SetFriction = /** @suppress {undefinedVars, duplicate} @this{Object} */function(friction) {
  var self = this.ptr;
  if (friction && typeof friction === 'object') friction = friction.ptr;
  _emscripten_bind_b2Fixture_SetFriction_1(self, friction);
};;

b2Fixture.prototype['GetRestitution'] = b2Fixture.prototype.GetRestitution = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Fixture_GetRestitution_0(self);
};;

b2Fixture.prototype['SetRestitution'] = b2Fixture.prototype.SetRestitution = /** @suppress {undefinedVars, duplicate} @this{Object} */function(restitution) {
  var self = this.ptr;
  if (restitution && typeof restitution === 'object') restitution = restitution.ptr;
  _emscripten_bind_b2Fixture_SetRestitution_1(self, restitution);
};;

b2Fixture.prototype['GetRestitutionThreshold'] = b2Fixture.prototype.GetRestitutionThreshold = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Fixture_GetRestitutionThreshold_0(self);
};;

b2Fixture.prototype['SetRestitutionThreshold'] = b2Fixture.prototype.SetRestitutionThreshold = /** @suppress {undefinedVars, duplicate} @this{Object} */function(threshold) {
  var self = this.ptr;
  if (threshold && typeof threshold === 'object') threshold = threshold.ptr;
  _emscripten_bind_b2Fixture_SetRestitutionThreshold_1(self, threshold);
};;

b2Fixture.prototype['GetAABB'] = b2Fixture.prototype.GetAABB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(childIndex) {
  var self = this.ptr;
  if (childIndex && typeof childIndex === 'object') childIndex = childIndex.ptr;
  return wrapPointer(_emscripten_bind_b2Fixture_GetAABB_1(self, childIndex), b2AABB);
};;

b2Fixture.prototype['Dump'] = b2Fixture.prototype.Dump = /** @suppress {undefinedVars, duplicate} @this{Object} */function(bodyIndex) {
  var self = this.ptr;
  if (bodyIndex && typeof bodyIndex === 'object') bodyIndex = bodyIndex.ptr;
  _emscripten_bind_b2Fixture_Dump_1(self, bodyIndex);
};;

  b2Fixture.prototype['__destroy__'] = b2Fixture.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Fixture___destroy___0(self);
};
// b2Transform
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Transform(position, rotation) {
  if (position && typeof position === 'object') position = position.ptr;
  if (rotation && typeof rotation === 'object') rotation = rotation.ptr;
  if (position === undefined) { this.ptr = _emscripten_bind_b2Transform_b2Transform_0(); getCache(b2Transform)[this.ptr] = this;return }
  if (rotation === undefined) { this.ptr = _emscripten_bind_b2Transform_b2Transform_1(position); getCache(b2Transform)[this.ptr] = this;return }
  this.ptr = _emscripten_bind_b2Transform_b2Transform_2(position, rotation);
  getCache(b2Transform)[this.ptr] = this;
};;
b2Transform.prototype = Object.create(WrapperObject.prototype);
b2Transform.prototype.constructor = b2Transform;
b2Transform.prototype.__class__ = b2Transform;
b2Transform.__cache__ = {};
Module['b2Transform'] = b2Transform;

b2Transform.prototype['SetIdentity'] = b2Transform.prototype.SetIdentity = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Transform_SetIdentity_0(self);
};;

b2Transform.prototype['Set'] = b2Transform.prototype.Set = /** @suppress {undefinedVars, duplicate} @this{Object} */function(position, angle) {
  var self = this.ptr;
  if (position && typeof position === 'object') position = position.ptr;
  if (angle && typeof angle === 'object') angle = angle.ptr;
  _emscripten_bind_b2Transform_Set_2(self, position, angle);
};;

  b2Transform.prototype['get_p'] = b2Transform.prototype.get_p = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Transform_get_p_0(self), b2Vec2);
};
    b2Transform.prototype['set_p'] = b2Transform.prototype.set_p = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Transform_set_p_1(self, arg0);
};
    Object.defineProperty(b2Transform.prototype, 'p', { get: b2Transform.prototype.get_p, set: b2Transform.prototype.set_p });
  b2Transform.prototype['get_q'] = b2Transform.prototype.get_q = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Transform_get_q_0(self), b2Rot);
};
    b2Transform.prototype['set_q'] = b2Transform.prototype.set_q = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Transform_set_q_1(self, arg0);
};
    Object.defineProperty(b2Transform.prototype, 'q', { get: b2Transform.prototype.get_q, set: b2Transform.prototype.set_q });
  b2Transform.prototype['__destroy__'] = b2Transform.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Transform___destroy___0(self);
};
// JSRayCastCallback
/** @suppress {undefinedVars, duplicate} @this{Object} */function JSRayCastCallback() {
  this.ptr = _emscripten_bind_JSRayCastCallback_JSRayCastCallback_0();
  getCache(JSRayCastCallback)[this.ptr] = this;
};;
JSRayCastCallback.prototype = Object.create(b2RayCastCallback.prototype);
JSRayCastCallback.prototype.constructor = JSRayCastCallback;
JSRayCastCallback.prototype.__class__ = JSRayCastCallback;
JSRayCastCallback.__cache__ = {};
Module['JSRayCastCallback'] = JSRayCastCallback;

JSRayCastCallback.prototype['ReportFixture'] = JSRayCastCallback.prototype.ReportFixture = /** @suppress {undefinedVars, duplicate} @this{Object} */function(fixture, point, normal, fraction) {
  var self = this.ptr;
  if (fixture && typeof fixture === 'object') fixture = fixture.ptr;
  if (point && typeof point === 'object') point = point.ptr;
  if (normal && typeof normal === 'object') normal = normal.ptr;
  if (fraction && typeof fraction === 'object') fraction = fraction.ptr;
  return _emscripten_bind_JSRayCastCallback_ReportFixture_4(self, fixture, point, normal, fraction);
};;

  JSRayCastCallback.prototype['__destroy__'] = JSRayCastCallback.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_JSRayCastCallback___destroy___0(self);
};
// JSQueryCallback
/** @suppress {undefinedVars, duplicate} @this{Object} */function JSQueryCallback() {
  this.ptr = _emscripten_bind_JSQueryCallback_JSQueryCallback_0();
  getCache(JSQueryCallback)[this.ptr] = this;
};;
JSQueryCallback.prototype = Object.create(b2QueryCallback.prototype);
JSQueryCallback.prototype.constructor = JSQueryCallback;
JSQueryCallback.prototype.__class__ = JSQueryCallback;
JSQueryCallback.__cache__ = {};
Module['JSQueryCallback'] = JSQueryCallback;

JSQueryCallback.prototype['ReportFixture'] = JSQueryCallback.prototype.ReportFixture = /** @suppress {undefinedVars, duplicate} @this{Object} */function(fixture) {
  var self = this.ptr;
  if (fixture && typeof fixture === 'object') fixture = fixture.ptr;
  return !!(_emscripten_bind_JSQueryCallback_ReportFixture_1(self, fixture));
};;

  JSQueryCallback.prototype['__destroy__'] = JSQueryCallback.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_JSQueryCallback___destroy___0(self);
};
// b2MassData
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2MassData() {
  this.ptr = _emscripten_bind_b2MassData_b2MassData_0();
  getCache(b2MassData)[this.ptr] = this;
};;
b2MassData.prototype = Object.create(WrapperObject.prototype);
b2MassData.prototype.constructor = b2MassData;
b2MassData.prototype.__class__ = b2MassData;
b2MassData.__cache__ = {};
Module['b2MassData'] = b2MassData;

  b2MassData.prototype['get_mass'] = b2MassData.prototype.get_mass = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MassData_get_mass_0(self);
};
    b2MassData.prototype['set_mass'] = b2MassData.prototype.set_mass = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MassData_set_mass_1(self, arg0);
};
    Object.defineProperty(b2MassData.prototype, 'mass', { get: b2MassData.prototype.get_mass, set: b2MassData.prototype.set_mass });
  b2MassData.prototype['get_center'] = b2MassData.prototype.get_center = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MassData_get_center_0(self), b2Vec2);
};
    b2MassData.prototype['set_center'] = b2MassData.prototype.set_center = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MassData_set_center_1(self, arg0);
};
    Object.defineProperty(b2MassData.prototype, 'center', { get: b2MassData.prototype.get_center, set: b2MassData.prototype.set_center });
  b2MassData.prototype['get_I'] = b2MassData.prototype.get_I = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MassData_get_I_0(self);
};
    b2MassData.prototype['set_I'] = b2MassData.prototype.set_I = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MassData_set_I_1(self, arg0);
};
    Object.defineProperty(b2MassData.prototype, 'I', { get: b2MassData.prototype.get_I, set: b2MassData.prototype.set_I });
  b2MassData.prototype['__destroy__'] = b2MassData.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2MassData___destroy___0(self);
};
// b2Vec2
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Vec2(x, y) {
  if (x && typeof x === 'object') x = x.ptr;
  if (y && typeof y === 'object') y = y.ptr;
  if (x === undefined) { this.ptr = _emscripten_bind_b2Vec2_b2Vec2_0(); getCache(b2Vec2)[this.ptr] = this;return }
  if (y === undefined) { this.ptr = _emscripten_bind_b2Vec2_b2Vec2_1(x); getCache(b2Vec2)[this.ptr] = this;return }
  this.ptr = _emscripten_bind_b2Vec2_b2Vec2_2(x, y);
  getCache(b2Vec2)[this.ptr] = this;
};;
b2Vec2.prototype = Object.create(WrapperObject.prototype);
b2Vec2.prototype.constructor = b2Vec2;
b2Vec2.prototype.__class__ = b2Vec2;
b2Vec2.__cache__ = {};
Module['b2Vec2'] = b2Vec2;

b2Vec2.prototype['SetZero'] = b2Vec2.prototype.SetZero = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Vec2_SetZero_0(self);
};;

b2Vec2.prototype['Set'] = b2Vec2.prototype.Set = /** @suppress {undefinedVars, duplicate} @this{Object} */function(x, y) {
  var self = this.ptr;
  if (x && typeof x === 'object') x = x.ptr;
  if (y && typeof y === 'object') y = y.ptr;
  _emscripten_bind_b2Vec2_Set_2(self, x, y);
};;

b2Vec2.prototype['op_add'] = b2Vec2.prototype.op_add = /** @suppress {undefinedVars, duplicate} @this{Object} */function(v) {
  var self = this.ptr;
  if (v && typeof v === 'object') v = v.ptr;
  _emscripten_bind_b2Vec2_op_add_1(self, v);
};;

b2Vec2.prototype['op_sub'] = b2Vec2.prototype.op_sub = /** @suppress {undefinedVars, duplicate} @this{Object} */function(v) {
  var self = this.ptr;
  if (v && typeof v === 'object') v = v.ptr;
  _emscripten_bind_b2Vec2_op_sub_1(self, v);
};;

b2Vec2.prototype['op_mul'] = b2Vec2.prototype.op_mul = /** @suppress {undefinedVars, duplicate} @this{Object} */function(s) {
  var self = this.ptr;
  if (s && typeof s === 'object') s = s.ptr;
  _emscripten_bind_b2Vec2_op_mul_1(self, s);
};;

b2Vec2.prototype['Length'] = b2Vec2.prototype.Length = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Vec2_Length_0(self);
};;

b2Vec2.prototype['LengthSquared'] = b2Vec2.prototype.LengthSquared = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Vec2_LengthSquared_0(self);
};;

b2Vec2.prototype['Normalize'] = b2Vec2.prototype.Normalize = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Vec2_Normalize_0(self);
};;

b2Vec2.prototype['IsValid'] = b2Vec2.prototype.IsValid = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2Vec2_IsValid_0(self));
};;

b2Vec2.prototype['Skew'] = b2Vec2.prototype.Skew = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Vec2_Skew_0(self), b2Vec2);
};;

  b2Vec2.prototype['get_x'] = b2Vec2.prototype.get_x = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Vec2_get_x_0(self);
};
    b2Vec2.prototype['set_x'] = b2Vec2.prototype.set_x = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Vec2_set_x_1(self, arg0);
};
    Object.defineProperty(b2Vec2.prototype, 'x', { get: b2Vec2.prototype.get_x, set: b2Vec2.prototype.set_x });
  b2Vec2.prototype['get_y'] = b2Vec2.prototype.get_y = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Vec2_get_y_0(self);
};
    b2Vec2.prototype['set_y'] = b2Vec2.prototype.set_y = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Vec2_set_y_1(self, arg0);
};
    Object.defineProperty(b2Vec2.prototype, 'y', { get: b2Vec2.prototype.get_y, set: b2Vec2.prototype.set_y });
  b2Vec2.prototype['__destroy__'] = b2Vec2.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Vec2___destroy___0(self);
};
// b2Vec3
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Vec3(x, y, z) {
  if (x && typeof x === 'object') x = x.ptr;
  if (y && typeof y === 'object') y = y.ptr;
  if (z && typeof z === 'object') z = z.ptr;
  if (x === undefined) { this.ptr = _emscripten_bind_b2Vec3_b2Vec3_0(); getCache(b2Vec3)[this.ptr] = this;return }
  if (y === undefined) { this.ptr = _emscripten_bind_b2Vec3_b2Vec3_1(x); getCache(b2Vec3)[this.ptr] = this;return }
  if (z === undefined) { this.ptr = _emscripten_bind_b2Vec3_b2Vec3_2(x, y); getCache(b2Vec3)[this.ptr] = this;return }
  this.ptr = _emscripten_bind_b2Vec3_b2Vec3_3(x, y, z);
  getCache(b2Vec3)[this.ptr] = this;
};;
b2Vec3.prototype = Object.create(WrapperObject.prototype);
b2Vec3.prototype.constructor = b2Vec3;
b2Vec3.prototype.__class__ = b2Vec3;
b2Vec3.__cache__ = {};
Module['b2Vec3'] = b2Vec3;

b2Vec3.prototype['SetZero'] = b2Vec3.prototype.SetZero = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Vec3_SetZero_0(self);
};;

b2Vec3.prototype['Set'] = b2Vec3.prototype.Set = /** @suppress {undefinedVars, duplicate} @this{Object} */function(x, y, z) {
  var self = this.ptr;
  if (x && typeof x === 'object') x = x.ptr;
  if (y && typeof y === 'object') y = y.ptr;
  if (z && typeof z === 'object') z = z.ptr;
  _emscripten_bind_b2Vec3_Set_3(self, x, y, z);
};;

b2Vec3.prototype['op_add'] = b2Vec3.prototype.op_add = /** @suppress {undefinedVars, duplicate} @this{Object} */function(v) {
  var self = this.ptr;
  if (v && typeof v === 'object') v = v.ptr;
  _emscripten_bind_b2Vec3_op_add_1(self, v);
};;

b2Vec3.prototype['op_sub'] = b2Vec3.prototype.op_sub = /** @suppress {undefinedVars, duplicate} @this{Object} */function(v) {
  var self = this.ptr;
  if (v && typeof v === 'object') v = v.ptr;
  _emscripten_bind_b2Vec3_op_sub_1(self, v);
};;

b2Vec3.prototype['op_mul'] = b2Vec3.prototype.op_mul = /** @suppress {undefinedVars, duplicate} @this{Object} */function(s) {
  var self = this.ptr;
  if (s && typeof s === 'object') s = s.ptr;
  _emscripten_bind_b2Vec3_op_mul_1(self, s);
};;

  b2Vec3.prototype['get_x'] = b2Vec3.prototype.get_x = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Vec3_get_x_0(self);
};
    b2Vec3.prototype['set_x'] = b2Vec3.prototype.set_x = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Vec3_set_x_1(self, arg0);
};
    Object.defineProperty(b2Vec3.prototype, 'x', { get: b2Vec3.prototype.get_x, set: b2Vec3.prototype.set_x });
  b2Vec3.prototype['get_y'] = b2Vec3.prototype.get_y = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Vec3_get_y_0(self);
};
    b2Vec3.prototype['set_y'] = b2Vec3.prototype.set_y = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Vec3_set_y_1(self, arg0);
};
    Object.defineProperty(b2Vec3.prototype, 'y', { get: b2Vec3.prototype.get_y, set: b2Vec3.prototype.set_y });
  b2Vec3.prototype['get_z'] = b2Vec3.prototype.get_z = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Vec3_get_z_0(self);
};
    b2Vec3.prototype['set_z'] = b2Vec3.prototype.set_z = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Vec3_set_z_1(self, arg0);
};
    Object.defineProperty(b2Vec3.prototype, 'z', { get: b2Vec3.prototype.get_z, set: b2Vec3.prototype.set_z });
  b2Vec3.prototype['__destroy__'] = b2Vec3.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Vec3___destroy___0(self);
};
// b2BodyUserData
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2BodyUserData() { throw "cannot construct a b2BodyUserData, no constructor in IDL" }
b2BodyUserData.prototype = Object.create(WrapperObject.prototype);
b2BodyUserData.prototype.constructor = b2BodyUserData;
b2BodyUserData.prototype.__class__ = b2BodyUserData;
b2BodyUserData.__cache__ = {};
Module['b2BodyUserData'] = b2BodyUserData;

  b2BodyUserData.prototype['get_pointer'] = b2BodyUserData.prototype.get_pointer = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2BodyUserData_get_pointer_0(self);
};
    b2BodyUserData.prototype['set_pointer'] = b2BodyUserData.prototype.set_pointer = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2BodyUserData_set_pointer_1(self, arg0);
};
    Object.defineProperty(b2BodyUserData.prototype, 'pointer', { get: b2BodyUserData.prototype.get_pointer, set: b2BodyUserData.prototype.set_pointer });
  b2BodyUserData.prototype['__destroy__'] = b2BodyUserData.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2BodyUserData___destroy___0(self);
};
// b2Body
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Body() { throw "cannot construct a b2Body, no constructor in IDL" }
b2Body.prototype = Object.create(WrapperObject.prototype);
b2Body.prototype.constructor = b2Body;
b2Body.prototype.__class__ = b2Body;
b2Body.__cache__ = {};
Module['b2Body'] = b2Body;

b2Body.prototype['CreateFixture'] = b2Body.prototype.CreateFixture = /** @suppress {undefinedVars, duplicate} @this{Object} */function(shape, density) {
  var self = this.ptr;
  if (shape && typeof shape === 'object') shape = shape.ptr;
  if (density && typeof density === 'object') density = density.ptr;
  if (density === undefined) { return wrapPointer(_emscripten_bind_b2Body_CreateFixture_1(self, shape), b2Fixture) }
  return wrapPointer(_emscripten_bind_b2Body_CreateFixture_2(self, shape, density), b2Fixture);
};;

b2Body.prototype['DestroyFixture'] = b2Body.prototype.DestroyFixture = /** @suppress {undefinedVars, duplicate} @this{Object} */function(fixture) {
  var self = this.ptr;
  if (fixture && typeof fixture === 'object') fixture = fixture.ptr;
  _emscripten_bind_b2Body_DestroyFixture_1(self, fixture);
};;

b2Body.prototype['SetTransform'] = b2Body.prototype.SetTransform = /** @suppress {undefinedVars, duplicate} @this{Object} */function(position, angle) {
  var self = this.ptr;
  if (position && typeof position === 'object') position = position.ptr;
  if (angle && typeof angle === 'object') angle = angle.ptr;
  _emscripten_bind_b2Body_SetTransform_2(self, position, angle);
};;

b2Body.prototype['GetTransform'] = b2Body.prototype.GetTransform = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetTransform_0(self), b2Transform);
};;

b2Body.prototype['GetPosition'] = b2Body.prototype.GetPosition = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetPosition_0(self), b2Vec2);
};;

b2Body.prototype['GetAngle'] = b2Body.prototype.GetAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Body_GetAngle_0(self);
};;

b2Body.prototype['GetWorldCenter'] = b2Body.prototype.GetWorldCenter = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetWorldCenter_0(self), b2Vec2);
};;

b2Body.prototype['GetLocalCenter'] = b2Body.prototype.GetLocalCenter = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetLocalCenter_0(self), b2Vec2);
};;

b2Body.prototype['SetLinearVelocity'] = b2Body.prototype.SetLinearVelocity = /** @suppress {undefinedVars, duplicate} @this{Object} */function(v) {
  var self = this.ptr;
  if (v && typeof v === 'object') v = v.ptr;
  _emscripten_bind_b2Body_SetLinearVelocity_1(self, v);
};;

b2Body.prototype['GetLinearVelocity'] = b2Body.prototype.GetLinearVelocity = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetLinearVelocity_0(self), b2Vec2);
};;

b2Body.prototype['SetAngularVelocity'] = b2Body.prototype.SetAngularVelocity = /** @suppress {undefinedVars, duplicate} @this{Object} */function(omega) {
  var self = this.ptr;
  if (omega && typeof omega === 'object') omega = omega.ptr;
  _emscripten_bind_b2Body_SetAngularVelocity_1(self, omega);
};;

b2Body.prototype['GetAngularVelocity'] = b2Body.prototype.GetAngularVelocity = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Body_GetAngularVelocity_0(self);
};;

b2Body.prototype['ApplyForce'] = b2Body.prototype.ApplyForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(force, point, wake) {
  var self = this.ptr;
  if (force && typeof force === 'object') force = force.ptr;
  if (point && typeof point === 'object') point = point.ptr;
  if (wake && typeof wake === 'object') wake = wake.ptr;
  _emscripten_bind_b2Body_ApplyForce_3(self, force, point, wake);
};;

b2Body.prototype['ApplyForceToCenter'] = b2Body.prototype.ApplyForceToCenter = /** @suppress {undefinedVars, duplicate} @this{Object} */function(force, wake) {
  var self = this.ptr;
  if (force && typeof force === 'object') force = force.ptr;
  if (wake && typeof wake === 'object') wake = wake.ptr;
  _emscripten_bind_b2Body_ApplyForceToCenter_2(self, force, wake);
};;

b2Body.prototype['ApplyTorque'] = b2Body.prototype.ApplyTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(torque, awake) {
  var self = this.ptr;
  if (torque && typeof torque === 'object') torque = torque.ptr;
  if (awake && typeof awake === 'object') awake = awake.ptr;
  _emscripten_bind_b2Body_ApplyTorque_2(self, torque, awake);
};;

b2Body.prototype['ApplyLinearImpulse'] = b2Body.prototype.ApplyLinearImpulse = /** @suppress {undefinedVars, duplicate} @this{Object} */function(impulse, point, wake) {
  var self = this.ptr;
  if (impulse && typeof impulse === 'object') impulse = impulse.ptr;
  if (point && typeof point === 'object') point = point.ptr;
  if (wake && typeof wake === 'object') wake = wake.ptr;
  _emscripten_bind_b2Body_ApplyLinearImpulse_3(self, impulse, point, wake);
};;

b2Body.prototype['ApplyLinearImpulseToCenter'] = b2Body.prototype.ApplyLinearImpulseToCenter = /** @suppress {undefinedVars, duplicate} @this{Object} */function(impulse, wake) {
  var self = this.ptr;
  if (impulse && typeof impulse === 'object') impulse = impulse.ptr;
  if (wake && typeof wake === 'object') wake = wake.ptr;
  _emscripten_bind_b2Body_ApplyLinearImpulseToCenter_2(self, impulse, wake);
};;

b2Body.prototype['ApplyAngularImpulse'] = b2Body.prototype.ApplyAngularImpulse = /** @suppress {undefinedVars, duplicate} @this{Object} */function(impulse, wake) {
  var self = this.ptr;
  if (impulse && typeof impulse === 'object') impulse = impulse.ptr;
  if (wake && typeof wake === 'object') wake = wake.ptr;
  _emscripten_bind_b2Body_ApplyAngularImpulse_2(self, impulse, wake);
};;

b2Body.prototype['GetMass'] = b2Body.prototype.GetMass = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Body_GetMass_0(self);
};;

b2Body.prototype['GetInertia'] = b2Body.prototype.GetInertia = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Body_GetInertia_0(self);
};;

b2Body.prototype['GetMassData'] = b2Body.prototype.GetMassData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(data) {
  var self = this.ptr;
  if (data && typeof data === 'object') data = data.ptr;
  _emscripten_bind_b2Body_GetMassData_1(self, data);
};;

b2Body.prototype['SetMassData'] = b2Body.prototype.SetMassData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(data) {
  var self = this.ptr;
  if (data && typeof data === 'object') data = data.ptr;
  _emscripten_bind_b2Body_SetMassData_1(self, data);
};;

b2Body.prototype['ResetMassData'] = b2Body.prototype.ResetMassData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Body_ResetMassData_0(self);
};;

b2Body.prototype['GetWorldPoint'] = b2Body.prototype.GetWorldPoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(localPoint) {
  var self = this.ptr;
  if (localPoint && typeof localPoint === 'object') localPoint = localPoint.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetWorldPoint_1(self, localPoint), b2Vec2);
};;

b2Body.prototype['GetWorldVector'] = b2Body.prototype.GetWorldVector = /** @suppress {undefinedVars, duplicate} @this{Object} */function(localVector) {
  var self = this.ptr;
  if (localVector && typeof localVector === 'object') localVector = localVector.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetWorldVector_1(self, localVector), b2Vec2);
};;

b2Body.prototype['GetLocalPoint'] = b2Body.prototype.GetLocalPoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(worldPoint) {
  var self = this.ptr;
  if (worldPoint && typeof worldPoint === 'object') worldPoint = worldPoint.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetLocalPoint_1(self, worldPoint), b2Vec2);
};;

b2Body.prototype['GetLocalVector'] = b2Body.prototype.GetLocalVector = /** @suppress {undefinedVars, duplicate} @this{Object} */function(worldVector) {
  var self = this.ptr;
  if (worldVector && typeof worldVector === 'object') worldVector = worldVector.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetLocalVector_1(self, worldVector), b2Vec2);
};;

b2Body.prototype['GetLinearVelocityFromWorldPoint'] = b2Body.prototype.GetLinearVelocityFromWorldPoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(worldPoint) {
  var self = this.ptr;
  if (worldPoint && typeof worldPoint === 'object') worldPoint = worldPoint.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetLinearVelocityFromWorldPoint_1(self, worldPoint), b2Vec2);
};;

b2Body.prototype['GetLinearVelocityFromLocalPoint'] = b2Body.prototype.GetLinearVelocityFromLocalPoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(localPoint) {
  var self = this.ptr;
  if (localPoint && typeof localPoint === 'object') localPoint = localPoint.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetLinearVelocityFromLocalPoint_1(self, localPoint), b2Vec2);
};;

b2Body.prototype['GetLinearDamping'] = b2Body.prototype.GetLinearDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Body_GetLinearDamping_0(self);
};;

b2Body.prototype['SetLinearDamping'] = b2Body.prototype.SetLinearDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(linearDamping) {
  var self = this.ptr;
  if (linearDamping && typeof linearDamping === 'object') linearDamping = linearDamping.ptr;
  _emscripten_bind_b2Body_SetLinearDamping_1(self, linearDamping);
};;

b2Body.prototype['GetAngularDamping'] = b2Body.prototype.GetAngularDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Body_GetAngularDamping_0(self);
};;

b2Body.prototype['SetAngularDamping'] = b2Body.prototype.SetAngularDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(angularDamping) {
  var self = this.ptr;
  if (angularDamping && typeof angularDamping === 'object') angularDamping = angularDamping.ptr;
  _emscripten_bind_b2Body_SetAngularDamping_1(self, angularDamping);
};;

b2Body.prototype['GetGravityScale'] = b2Body.prototype.GetGravityScale = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Body_GetGravityScale_0(self);
};;

b2Body.prototype['SetGravityScale'] = b2Body.prototype.SetGravityScale = /** @suppress {undefinedVars, duplicate} @this{Object} */function(scale) {
  var self = this.ptr;
  if (scale && typeof scale === 'object') scale = scale.ptr;
  _emscripten_bind_b2Body_SetGravityScale_1(self, scale);
};;

b2Body.prototype['SetType'] = b2Body.prototype.SetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function(type) {
  var self = this.ptr;
  if (type && typeof type === 'object') type = type.ptr;
  _emscripten_bind_b2Body_SetType_1(self, type);
};;

b2Body.prototype['GetType'] = b2Body.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Body_GetType_0(self);
};;

b2Body.prototype['SetBullet'] = b2Body.prototype.SetBullet = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2Body_SetBullet_1(self, flag);
};;

b2Body.prototype['IsBullet'] = b2Body.prototype.IsBullet = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2Body_IsBullet_0(self));
};;

b2Body.prototype['SetSleepingAllowed'] = b2Body.prototype.SetSleepingAllowed = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2Body_SetSleepingAllowed_1(self, flag);
};;

b2Body.prototype['IsSleepingAllowed'] = b2Body.prototype.IsSleepingAllowed = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2Body_IsSleepingAllowed_0(self));
};;

b2Body.prototype['SetAwake'] = b2Body.prototype.SetAwake = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2Body_SetAwake_1(self, flag);
};;

b2Body.prototype['IsAwake'] = b2Body.prototype.IsAwake = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2Body_IsAwake_0(self));
};;

b2Body.prototype['SetEnabled'] = b2Body.prototype.SetEnabled = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2Body_SetEnabled_1(self, flag);
};;

b2Body.prototype['IsEnabled'] = b2Body.prototype.IsEnabled = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2Body_IsEnabled_0(self));
};;

b2Body.prototype['SetFixedRotation'] = b2Body.prototype.SetFixedRotation = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2Body_SetFixedRotation_1(self, flag);
};;

b2Body.prototype['IsFixedRotation'] = b2Body.prototype.IsFixedRotation = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2Body_IsFixedRotation_0(self));
};;

b2Body.prototype['GetFixtureList'] = b2Body.prototype.GetFixtureList = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetFixtureList_0(self), b2Fixture);
};;

b2Body.prototype['GetJointList'] = b2Body.prototype.GetJointList = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetJointList_0(self), b2JointEdge);
};;

b2Body.prototype['GetContactList'] = b2Body.prototype.GetContactList = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetContactList_0(self), b2ContactEdge);
};;

b2Body.prototype['GetNext'] = b2Body.prototype.GetNext = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetNext_0(self), b2Body);
};;

b2Body.prototype['GetUserData'] = b2Body.prototype.GetUserData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetUserData_0(self), b2BodyUserData);
};;

b2Body.prototype['GetWorld'] = b2Body.prototype.GetWorld = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Body_GetWorld_0(self), b2World);
};;

b2Body.prototype['Dump'] = b2Body.prototype.Dump = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Body_Dump_0(self);
};;

// b2BodyDef
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2BodyDef() {
  this.ptr = _emscripten_bind_b2BodyDef_b2BodyDef_0();
  getCache(b2BodyDef)[this.ptr] = this;
};;
b2BodyDef.prototype = Object.create(WrapperObject.prototype);
b2BodyDef.prototype.constructor = b2BodyDef;
b2BodyDef.prototype.__class__ = b2BodyDef;
b2BodyDef.__cache__ = {};
Module['b2BodyDef'] = b2BodyDef;

  b2BodyDef.prototype['get_type'] = b2BodyDef.prototype.get_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2BodyDef_get_type_0(self);
};
    b2BodyDef.prototype['set_type'] = b2BodyDef.prototype.set_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2BodyDef_set_type_1(self, arg0);
};
    Object.defineProperty(b2BodyDef.prototype, 'type', { get: b2BodyDef.prototype.get_type, set: b2BodyDef.prototype.set_type });
  b2BodyDef.prototype['get_position'] = b2BodyDef.prototype.get_position = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2BodyDef_get_position_0(self), b2Vec2);
};
    b2BodyDef.prototype['set_position'] = b2BodyDef.prototype.set_position = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2BodyDef_set_position_1(self, arg0);
};
    Object.defineProperty(b2BodyDef.prototype, 'position', { get: b2BodyDef.prototype.get_position, set: b2BodyDef.prototype.set_position });
  b2BodyDef.prototype['get_angle'] = b2BodyDef.prototype.get_angle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2BodyDef_get_angle_0(self);
};
    b2BodyDef.prototype['set_angle'] = b2BodyDef.prototype.set_angle = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2BodyDef_set_angle_1(self, arg0);
};
    Object.defineProperty(b2BodyDef.prototype, 'angle', { get: b2BodyDef.prototype.get_angle, set: b2BodyDef.prototype.set_angle });
  b2BodyDef.prototype['get_linearVelocity'] = b2BodyDef.prototype.get_linearVelocity = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2BodyDef_get_linearVelocity_0(self), b2Vec2);
};
    b2BodyDef.prototype['set_linearVelocity'] = b2BodyDef.prototype.set_linearVelocity = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2BodyDef_set_linearVelocity_1(self, arg0);
};
    Object.defineProperty(b2BodyDef.prototype, 'linearVelocity', { get: b2BodyDef.prototype.get_linearVelocity, set: b2BodyDef.prototype.set_linearVelocity });
  b2BodyDef.prototype['get_angularVelocity'] = b2BodyDef.prototype.get_angularVelocity = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2BodyDef_get_angularVelocity_0(self);
};
    b2BodyDef.prototype['set_angularVelocity'] = b2BodyDef.prototype.set_angularVelocity = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2BodyDef_set_angularVelocity_1(self, arg0);
};
    Object.defineProperty(b2BodyDef.prototype, 'angularVelocity', { get: b2BodyDef.prototype.get_angularVelocity, set: b2BodyDef.prototype.set_angularVelocity });
  b2BodyDef.prototype['get_linearDamping'] = b2BodyDef.prototype.get_linearDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2BodyDef_get_linearDamping_0(self);
};
    b2BodyDef.prototype['set_linearDamping'] = b2BodyDef.prototype.set_linearDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2BodyDef_set_linearDamping_1(self, arg0);
};
    Object.defineProperty(b2BodyDef.prototype, 'linearDamping', { get: b2BodyDef.prototype.get_linearDamping, set: b2BodyDef.prototype.set_linearDamping });
  b2BodyDef.prototype['get_angularDamping'] = b2BodyDef.prototype.get_angularDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2BodyDef_get_angularDamping_0(self);
};
    b2BodyDef.prototype['set_angularDamping'] = b2BodyDef.prototype.set_angularDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2BodyDef_set_angularDamping_1(self, arg0);
};
    Object.defineProperty(b2BodyDef.prototype, 'angularDamping', { get: b2BodyDef.prototype.get_angularDamping, set: b2BodyDef.prototype.set_angularDamping });
  b2BodyDef.prototype['get_allowSleep'] = b2BodyDef.prototype.get_allowSleep = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2BodyDef_get_allowSleep_0(self));
};
    b2BodyDef.prototype['set_allowSleep'] = b2BodyDef.prototype.set_allowSleep = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2BodyDef_set_allowSleep_1(self, arg0);
};
    Object.defineProperty(b2BodyDef.prototype, 'allowSleep', { get: b2BodyDef.prototype.get_allowSleep, set: b2BodyDef.prototype.set_allowSleep });
  b2BodyDef.prototype['get_awake'] = b2BodyDef.prototype.get_awake = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2BodyDef_get_awake_0(self));
};
    b2BodyDef.prototype['set_awake'] = b2BodyDef.prototype.set_awake = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2BodyDef_set_awake_1(self, arg0);
};
    Object.defineProperty(b2BodyDef.prototype, 'awake', { get: b2BodyDef.prototype.get_awake, set: b2BodyDef.prototype.set_awake });
  b2BodyDef.prototype['get_fixedRotation'] = b2BodyDef.prototype.get_fixedRotation = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2BodyDef_get_fixedRotation_0(self));
};
    b2BodyDef.prototype['set_fixedRotation'] = b2BodyDef.prototype.set_fixedRotation = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2BodyDef_set_fixedRotation_1(self, arg0);
};
    Object.defineProperty(b2BodyDef.prototype, 'fixedRotation', { get: b2BodyDef.prototype.get_fixedRotation, set: b2BodyDef.prototype.set_fixedRotation });
  b2BodyDef.prototype['get_bullet'] = b2BodyDef.prototype.get_bullet = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2BodyDef_get_bullet_0(self));
};
    b2BodyDef.prototype['set_bullet'] = b2BodyDef.prototype.set_bullet = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2BodyDef_set_bullet_1(self, arg0);
};
    Object.defineProperty(b2BodyDef.prototype, 'bullet', { get: b2BodyDef.prototype.get_bullet, set: b2BodyDef.prototype.set_bullet });
  b2BodyDef.prototype['get_enabled'] = b2BodyDef.prototype.get_enabled = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2BodyDef_get_enabled_0(self));
};
    b2BodyDef.prototype['set_enabled'] = b2BodyDef.prototype.set_enabled = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2BodyDef_set_enabled_1(self, arg0);
};
    Object.defineProperty(b2BodyDef.prototype, 'enabled', { get: b2BodyDef.prototype.get_enabled, set: b2BodyDef.prototype.set_enabled });
  b2BodyDef.prototype['get_userData'] = b2BodyDef.prototype.get_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2BodyDef_get_userData_0(self), b2BodyUserData);
};
    b2BodyDef.prototype['set_userData'] = b2BodyDef.prototype.set_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2BodyDef_set_userData_1(self, arg0);
};
    Object.defineProperty(b2BodyDef.prototype, 'userData', { get: b2BodyDef.prototype.get_userData, set: b2BodyDef.prototype.set_userData });
  b2BodyDef.prototype['get_gravityScale'] = b2BodyDef.prototype.get_gravityScale = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2BodyDef_get_gravityScale_0(self);
};
    b2BodyDef.prototype['set_gravityScale'] = b2BodyDef.prototype.set_gravityScale = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2BodyDef_set_gravityScale_1(self, arg0);
};
    Object.defineProperty(b2BodyDef.prototype, 'gravityScale', { get: b2BodyDef.prototype.get_gravityScale, set: b2BodyDef.prototype.set_gravityScale });
  b2BodyDef.prototype['__destroy__'] = b2BodyDef.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2BodyDef___destroy___0(self);
};
// b2Filter
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Filter() {
  this.ptr = _emscripten_bind_b2Filter_b2Filter_0();
  getCache(b2Filter)[this.ptr] = this;
};;
b2Filter.prototype = Object.create(WrapperObject.prototype);
b2Filter.prototype.constructor = b2Filter;
b2Filter.prototype.__class__ = b2Filter;
b2Filter.__cache__ = {};
Module['b2Filter'] = b2Filter;

  b2Filter.prototype['get_categoryBits'] = b2Filter.prototype.get_categoryBits = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Filter_get_categoryBits_0(self);
};
    b2Filter.prototype['set_categoryBits'] = b2Filter.prototype.set_categoryBits = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Filter_set_categoryBits_1(self, arg0);
};
    Object.defineProperty(b2Filter.prototype, 'categoryBits', { get: b2Filter.prototype.get_categoryBits, set: b2Filter.prototype.set_categoryBits });
  b2Filter.prototype['get_maskBits'] = b2Filter.prototype.get_maskBits = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Filter_get_maskBits_0(self);
};
    b2Filter.prototype['set_maskBits'] = b2Filter.prototype.set_maskBits = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Filter_set_maskBits_1(self, arg0);
};
    Object.defineProperty(b2Filter.prototype, 'maskBits', { get: b2Filter.prototype.get_maskBits, set: b2Filter.prototype.set_maskBits });
  b2Filter.prototype['get_groupIndex'] = b2Filter.prototype.get_groupIndex = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Filter_get_groupIndex_0(self);
};
    b2Filter.prototype['set_groupIndex'] = b2Filter.prototype.set_groupIndex = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Filter_set_groupIndex_1(self, arg0);
};
    Object.defineProperty(b2Filter.prototype, 'groupIndex', { get: b2Filter.prototype.get_groupIndex, set: b2Filter.prototype.set_groupIndex });
  b2Filter.prototype['__destroy__'] = b2Filter.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Filter___destroy___0(self);
};
// b2AABB
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2AABB() {
  this.ptr = _emscripten_bind_b2AABB_b2AABB_0();
  getCache(b2AABB)[this.ptr] = this;
};;
b2AABB.prototype = Object.create(WrapperObject.prototype);
b2AABB.prototype.constructor = b2AABB;
b2AABB.prototype.__class__ = b2AABB;
b2AABB.__cache__ = {};
Module['b2AABB'] = b2AABB;

b2AABB.prototype['IsValid'] = b2AABB.prototype.IsValid = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2AABB_IsValid_0(self));
};;

b2AABB.prototype['GetCenter'] = b2AABB.prototype.GetCenter = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2AABB_GetCenter_0(self), b2Vec2);
};;

b2AABB.prototype['GetExtents'] = b2AABB.prototype.GetExtents = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2AABB_GetExtents_0(self), b2Vec2);
};;

b2AABB.prototype['GetPerimeter'] = b2AABB.prototype.GetPerimeter = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2AABB_GetPerimeter_0(self);
};;

b2AABB.prototype['Combine'] = b2AABB.prototype.Combine = /** @suppress {undefinedVars, duplicate} @this{Object} */function(aabb1, aabb2) {
  var self = this.ptr;
  if (aabb1 && typeof aabb1 === 'object') aabb1 = aabb1.ptr;
  if (aabb2 && typeof aabb2 === 'object') aabb2 = aabb2.ptr;
  if (aabb2 === undefined) { _emscripten_bind_b2AABB_Combine_1(self, aabb1);  return }
  _emscripten_bind_b2AABB_Combine_2(self, aabb1, aabb2);
};;

b2AABB.prototype['Contains'] = b2AABB.prototype.Contains = /** @suppress {undefinedVars, duplicate} @this{Object} */function(aabb) {
  var self = this.ptr;
  if (aabb && typeof aabb === 'object') aabb = aabb.ptr;
  return !!(_emscripten_bind_b2AABB_Contains_1(self, aabb));
};;

b2AABB.prototype['RayCast'] = b2AABB.prototype.RayCast = /** @suppress {undefinedVars, duplicate} @this{Object} */function(output, input) {
  var self = this.ptr;
  if (output && typeof output === 'object') output = output.ptr;
  if (input && typeof input === 'object') input = input.ptr;
  return !!(_emscripten_bind_b2AABB_RayCast_2(self, output, input));
};;

  b2AABB.prototype['get_lowerBound'] = b2AABB.prototype.get_lowerBound = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2AABB_get_lowerBound_0(self), b2Vec2);
};
    b2AABB.prototype['set_lowerBound'] = b2AABB.prototype.set_lowerBound = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2AABB_set_lowerBound_1(self, arg0);
};
    Object.defineProperty(b2AABB.prototype, 'lowerBound', { get: b2AABB.prototype.get_lowerBound, set: b2AABB.prototype.set_lowerBound });
  b2AABB.prototype['get_upperBound'] = b2AABB.prototype.get_upperBound = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2AABB_get_upperBound_0(self), b2Vec2);
};
    b2AABB.prototype['set_upperBound'] = b2AABB.prototype.set_upperBound = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2AABB_set_upperBound_1(self, arg0);
};
    Object.defineProperty(b2AABB.prototype, 'upperBound', { get: b2AABB.prototype.get_upperBound, set: b2AABB.prototype.set_upperBound });
  b2AABB.prototype['__destroy__'] = b2AABB.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2AABB___destroy___0(self);
};
// b2CircleShape
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2CircleShape() {
  this.ptr = _emscripten_bind_b2CircleShape_b2CircleShape_0();
  getCache(b2CircleShape)[this.ptr] = this;
};;
b2CircleShape.prototype = Object.create(b2Shape.prototype);
b2CircleShape.prototype.constructor = b2CircleShape;
b2CircleShape.prototype.__class__ = b2CircleShape;
b2CircleShape.__cache__ = {};
Module['b2CircleShape'] = b2CircleShape;

b2CircleShape.prototype['GetType'] = b2CircleShape.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2CircleShape_GetType_0(self);
};;

b2CircleShape.prototype['GetChildCount'] = b2CircleShape.prototype.GetChildCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2CircleShape_GetChildCount_0(self);
};;

b2CircleShape.prototype['TestPoint'] = b2CircleShape.prototype.TestPoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(xf, p) {
  var self = this.ptr;
  if (xf && typeof xf === 'object') xf = xf.ptr;
  if (p && typeof p === 'object') p = p.ptr;
  return !!(_emscripten_bind_b2CircleShape_TestPoint_2(self, xf, p));
};;

b2CircleShape.prototype['RayCast'] = b2CircleShape.prototype.RayCast = /** @suppress {undefinedVars, duplicate} @this{Object} */function(output, input, transform, childIndex) {
  var self = this.ptr;
  if (output && typeof output === 'object') output = output.ptr;
  if (input && typeof input === 'object') input = input.ptr;
  if (transform && typeof transform === 'object') transform = transform.ptr;
  if (childIndex && typeof childIndex === 'object') childIndex = childIndex.ptr;
  return !!(_emscripten_bind_b2CircleShape_RayCast_4(self, output, input, transform, childIndex));
};;

b2CircleShape.prototype['ComputeAABB'] = b2CircleShape.prototype.ComputeAABB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(aabb, xf, childIndex) {
  var self = this.ptr;
  if (aabb && typeof aabb === 'object') aabb = aabb.ptr;
  if (xf && typeof xf === 'object') xf = xf.ptr;
  if (childIndex && typeof childIndex === 'object') childIndex = childIndex.ptr;
  _emscripten_bind_b2CircleShape_ComputeAABB_3(self, aabb, xf, childIndex);
};;

b2CircleShape.prototype['ComputeMass'] = b2CircleShape.prototype.ComputeMass = /** @suppress {undefinedVars, duplicate} @this{Object} */function(massData, density) {
  var self = this.ptr;
  if (massData && typeof massData === 'object') massData = massData.ptr;
  if (density && typeof density === 'object') density = density.ptr;
  _emscripten_bind_b2CircleShape_ComputeMass_2(self, massData, density);
};;

  b2CircleShape.prototype['get_m_p'] = b2CircleShape.prototype.get_m_p = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2CircleShape_get_m_p_0(self), b2Vec2);
};
    b2CircleShape.prototype['set_m_p'] = b2CircleShape.prototype.set_m_p = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2CircleShape_set_m_p_1(self, arg0);
};
    Object.defineProperty(b2CircleShape.prototype, 'm_p', { get: b2CircleShape.prototype.get_m_p, set: b2CircleShape.prototype.set_m_p });
  b2CircleShape.prototype['get_m_type'] = b2CircleShape.prototype.get_m_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2CircleShape_get_m_type_0(self);
};
    b2CircleShape.prototype['set_m_type'] = b2CircleShape.prototype.set_m_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2CircleShape_set_m_type_1(self, arg0);
};
    Object.defineProperty(b2CircleShape.prototype, 'm_type', { get: b2CircleShape.prototype.get_m_type, set: b2CircleShape.prototype.set_m_type });
  b2CircleShape.prototype['get_m_radius'] = b2CircleShape.prototype.get_m_radius = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2CircleShape_get_m_radius_0(self);
};
    b2CircleShape.prototype['set_m_radius'] = b2CircleShape.prototype.set_m_radius = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2CircleShape_set_m_radius_1(self, arg0);
};
    Object.defineProperty(b2CircleShape.prototype, 'm_radius', { get: b2CircleShape.prototype.get_m_radius, set: b2CircleShape.prototype.set_m_radius });
  b2CircleShape.prototype['__destroy__'] = b2CircleShape.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2CircleShape___destroy___0(self);
};
// b2EdgeShape
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2EdgeShape() {
  this.ptr = _emscripten_bind_b2EdgeShape_b2EdgeShape_0();
  getCache(b2EdgeShape)[this.ptr] = this;
};;
b2EdgeShape.prototype = Object.create(b2Shape.prototype);
b2EdgeShape.prototype.constructor = b2EdgeShape;
b2EdgeShape.prototype.__class__ = b2EdgeShape;
b2EdgeShape.__cache__ = {};
Module['b2EdgeShape'] = b2EdgeShape;

b2EdgeShape.prototype['SetOneSided'] = b2EdgeShape.prototype.SetOneSided = /** @suppress {undefinedVars, duplicate} @this{Object} */function(v0, v1, v2, v3) {
  var self = this.ptr;
  if (v0 && typeof v0 === 'object') v0 = v0.ptr;
  if (v1 && typeof v1 === 'object') v1 = v1.ptr;
  if (v2 && typeof v2 === 'object') v2 = v2.ptr;
  if (v3 && typeof v3 === 'object') v3 = v3.ptr;
  _emscripten_bind_b2EdgeShape_SetOneSided_4(self, v0, v1, v2, v3);
};;

b2EdgeShape.prototype['SetTwoSided'] = b2EdgeShape.prototype.SetTwoSided = /** @suppress {undefinedVars, duplicate} @this{Object} */function(v1, v2) {
  var self = this.ptr;
  if (v1 && typeof v1 === 'object') v1 = v1.ptr;
  if (v2 && typeof v2 === 'object') v2 = v2.ptr;
  _emscripten_bind_b2EdgeShape_SetTwoSided_2(self, v1, v2);
};;

b2EdgeShape.prototype['GetType'] = b2EdgeShape.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2EdgeShape_GetType_0(self);
};;

b2EdgeShape.prototype['GetChildCount'] = b2EdgeShape.prototype.GetChildCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2EdgeShape_GetChildCount_0(self);
};;

b2EdgeShape.prototype['TestPoint'] = b2EdgeShape.prototype.TestPoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(xf, p) {
  var self = this.ptr;
  if (xf && typeof xf === 'object') xf = xf.ptr;
  if (p && typeof p === 'object') p = p.ptr;
  return !!(_emscripten_bind_b2EdgeShape_TestPoint_2(self, xf, p));
};;

b2EdgeShape.prototype['RayCast'] = b2EdgeShape.prototype.RayCast = /** @suppress {undefinedVars, duplicate} @this{Object} */function(output, input, transform, childIndex) {
  var self = this.ptr;
  if (output && typeof output === 'object') output = output.ptr;
  if (input && typeof input === 'object') input = input.ptr;
  if (transform && typeof transform === 'object') transform = transform.ptr;
  if (childIndex && typeof childIndex === 'object') childIndex = childIndex.ptr;
  return !!(_emscripten_bind_b2EdgeShape_RayCast_4(self, output, input, transform, childIndex));
};;

b2EdgeShape.prototype['ComputeAABB'] = b2EdgeShape.prototype.ComputeAABB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(aabb, xf, childIndex) {
  var self = this.ptr;
  if (aabb && typeof aabb === 'object') aabb = aabb.ptr;
  if (xf && typeof xf === 'object') xf = xf.ptr;
  if (childIndex && typeof childIndex === 'object') childIndex = childIndex.ptr;
  _emscripten_bind_b2EdgeShape_ComputeAABB_3(self, aabb, xf, childIndex);
};;

b2EdgeShape.prototype['ComputeMass'] = b2EdgeShape.prototype.ComputeMass = /** @suppress {undefinedVars, duplicate} @this{Object} */function(massData, density) {
  var self = this.ptr;
  if (massData && typeof massData === 'object') massData = massData.ptr;
  if (density && typeof density === 'object') density = density.ptr;
  _emscripten_bind_b2EdgeShape_ComputeMass_2(self, massData, density);
};;

  b2EdgeShape.prototype['get_m_vertex1'] = b2EdgeShape.prototype.get_m_vertex1 = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2EdgeShape_get_m_vertex1_0(self), b2Vec2);
};
    b2EdgeShape.prototype['set_m_vertex1'] = b2EdgeShape.prototype.set_m_vertex1 = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2EdgeShape_set_m_vertex1_1(self, arg0);
};
    Object.defineProperty(b2EdgeShape.prototype, 'm_vertex1', { get: b2EdgeShape.prototype.get_m_vertex1, set: b2EdgeShape.prototype.set_m_vertex1 });
  b2EdgeShape.prototype['get_m_vertex2'] = b2EdgeShape.prototype.get_m_vertex2 = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2EdgeShape_get_m_vertex2_0(self), b2Vec2);
};
    b2EdgeShape.prototype['set_m_vertex2'] = b2EdgeShape.prototype.set_m_vertex2 = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2EdgeShape_set_m_vertex2_1(self, arg0);
};
    Object.defineProperty(b2EdgeShape.prototype, 'm_vertex2', { get: b2EdgeShape.prototype.get_m_vertex2, set: b2EdgeShape.prototype.set_m_vertex2 });
  b2EdgeShape.prototype['get_m_vertex0'] = b2EdgeShape.prototype.get_m_vertex0 = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2EdgeShape_get_m_vertex0_0(self), b2Vec2);
};
    b2EdgeShape.prototype['set_m_vertex0'] = b2EdgeShape.prototype.set_m_vertex0 = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2EdgeShape_set_m_vertex0_1(self, arg0);
};
    Object.defineProperty(b2EdgeShape.prototype, 'm_vertex0', { get: b2EdgeShape.prototype.get_m_vertex0, set: b2EdgeShape.prototype.set_m_vertex0 });
  b2EdgeShape.prototype['get_m_vertex3'] = b2EdgeShape.prototype.get_m_vertex3 = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2EdgeShape_get_m_vertex3_0(self), b2Vec2);
};
    b2EdgeShape.prototype['set_m_vertex3'] = b2EdgeShape.prototype.set_m_vertex3 = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2EdgeShape_set_m_vertex3_1(self, arg0);
};
    Object.defineProperty(b2EdgeShape.prototype, 'm_vertex3', { get: b2EdgeShape.prototype.get_m_vertex3, set: b2EdgeShape.prototype.set_m_vertex3 });
  b2EdgeShape.prototype['get_m_oneSided'] = b2EdgeShape.prototype.get_m_oneSided = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2EdgeShape_get_m_oneSided_0(self));
};
    b2EdgeShape.prototype['set_m_oneSided'] = b2EdgeShape.prototype.set_m_oneSided = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2EdgeShape_set_m_oneSided_1(self, arg0);
};
    Object.defineProperty(b2EdgeShape.prototype, 'm_oneSided', { get: b2EdgeShape.prototype.get_m_oneSided, set: b2EdgeShape.prototype.set_m_oneSided });
  b2EdgeShape.prototype['get_m_type'] = b2EdgeShape.prototype.get_m_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2EdgeShape_get_m_type_0(self);
};
    b2EdgeShape.prototype['set_m_type'] = b2EdgeShape.prototype.set_m_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2EdgeShape_set_m_type_1(self, arg0);
};
    Object.defineProperty(b2EdgeShape.prototype, 'm_type', { get: b2EdgeShape.prototype.get_m_type, set: b2EdgeShape.prototype.set_m_type });
  b2EdgeShape.prototype['get_m_radius'] = b2EdgeShape.prototype.get_m_radius = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2EdgeShape_get_m_radius_0(self);
};
    b2EdgeShape.prototype['set_m_radius'] = b2EdgeShape.prototype.set_m_radius = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2EdgeShape_set_m_radius_1(self, arg0);
};
    Object.defineProperty(b2EdgeShape.prototype, 'm_radius', { get: b2EdgeShape.prototype.get_m_radius, set: b2EdgeShape.prototype.set_m_radius });
  b2EdgeShape.prototype['__destroy__'] = b2EdgeShape.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2EdgeShape___destroy___0(self);
};
// b2JointUserData
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2JointUserData() { throw "cannot construct a b2JointUserData, no constructor in IDL" }
b2JointUserData.prototype = Object.create(WrapperObject.prototype);
b2JointUserData.prototype.constructor = b2JointUserData;
b2JointUserData.prototype.__class__ = b2JointUserData;
b2JointUserData.__cache__ = {};
Module['b2JointUserData'] = b2JointUserData;

  b2JointUserData.prototype['get_pointer'] = b2JointUserData.prototype.get_pointer = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2JointUserData_get_pointer_0(self);
};
    b2JointUserData.prototype['set_pointer'] = b2JointUserData.prototype.set_pointer = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2JointUserData_set_pointer_1(self, arg0);
};
    Object.defineProperty(b2JointUserData.prototype, 'pointer', { get: b2JointUserData.prototype.get_pointer, set: b2JointUserData.prototype.set_pointer });
  b2JointUserData.prototype['__destroy__'] = b2JointUserData.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2JointUserData___destroy___0(self);
};
// b2WeldJoint
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2WeldJoint() { throw "cannot construct a b2WeldJoint, no constructor in IDL" }
b2WeldJoint.prototype = Object.create(b2Joint.prototype);
b2WeldJoint.prototype.constructor = b2WeldJoint;
b2WeldJoint.prototype.__class__ = b2WeldJoint;
b2WeldJoint.__cache__ = {};
Module['b2WeldJoint'] = b2WeldJoint;

b2WeldJoint.prototype['GetLocalAnchorA'] = b2WeldJoint.prototype.GetLocalAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WeldJoint_GetLocalAnchorA_0(self), b2Vec2);
};;

b2WeldJoint.prototype['GetLocalAnchorB'] = b2WeldJoint.prototype.GetLocalAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WeldJoint_GetLocalAnchorB_0(self), b2Vec2);
};;

b2WeldJoint.prototype['GetReferenceAngle'] = b2WeldJoint.prototype.GetReferenceAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WeldJoint_GetReferenceAngle_0(self);
};;

b2WeldJoint.prototype['SetStiffness'] = b2WeldJoint.prototype.SetStiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function(stiffness) {
  var self = this.ptr;
  if (stiffness && typeof stiffness === 'object') stiffness = stiffness.ptr;
  _emscripten_bind_b2WeldJoint_SetStiffness_1(self, stiffness);
};;

b2WeldJoint.prototype['GetStiffness'] = b2WeldJoint.prototype.GetStiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WeldJoint_GetStiffness_0(self);
};;

b2WeldJoint.prototype['SetDamping'] = b2WeldJoint.prototype.SetDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(damping) {
  var self = this.ptr;
  if (damping && typeof damping === 'object') damping = damping.ptr;
  _emscripten_bind_b2WeldJoint_SetDamping_1(self, damping);
};;

b2WeldJoint.prototype['GetDamping'] = b2WeldJoint.prototype.GetDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WeldJoint_GetDamping_0(self);
};;

b2WeldJoint.prototype['Dump'] = b2WeldJoint.prototype.Dump = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2WeldJoint_Dump_0(self);
};;

b2WeldJoint.prototype['GetType'] = b2WeldJoint.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WeldJoint_GetType_0(self);
};;

b2WeldJoint.prototype['GetBodyA'] = b2WeldJoint.prototype.GetBodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WeldJoint_GetBodyA_0(self), b2Body);
};;

b2WeldJoint.prototype['GetBodyB'] = b2WeldJoint.prototype.GetBodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WeldJoint_GetBodyB_0(self), b2Body);
};;

b2WeldJoint.prototype['GetAnchorA'] = b2WeldJoint.prototype.GetAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WeldJoint_GetAnchorA_0(self), b2Vec2);
};;

b2WeldJoint.prototype['GetAnchorB'] = b2WeldJoint.prototype.GetAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WeldJoint_GetAnchorB_0(self), b2Vec2);
};;

b2WeldJoint.prototype['GetReactionForce'] = b2WeldJoint.prototype.GetReactionForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return wrapPointer(_emscripten_bind_b2WeldJoint_GetReactionForce_1(self, inv_dt), b2Vec2);
};;

b2WeldJoint.prototype['GetReactionTorque'] = b2WeldJoint.prototype.GetReactionTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return _emscripten_bind_b2WeldJoint_GetReactionTorque_1(self, inv_dt);
};;

b2WeldJoint.prototype['GetNext'] = b2WeldJoint.prototype.GetNext = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WeldJoint_GetNext_0(self), b2Joint);
};;

b2WeldJoint.prototype['GetUserData'] = b2WeldJoint.prototype.GetUserData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WeldJoint_GetUserData_0(self), b2JointUserData);
};;

b2WeldJoint.prototype['GetCollideConnected'] = b2WeldJoint.prototype.GetCollideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2WeldJoint_GetCollideConnected_0(self));
};;

  b2WeldJoint.prototype['__destroy__'] = b2WeldJoint.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2WeldJoint___destroy___0(self);
};
// b2WeldJointDef
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2WeldJointDef() {
  this.ptr = _emscripten_bind_b2WeldJointDef_b2WeldJointDef_0();
  getCache(b2WeldJointDef)[this.ptr] = this;
};;
b2WeldJointDef.prototype = Object.create(b2JointDef.prototype);
b2WeldJointDef.prototype.constructor = b2WeldJointDef;
b2WeldJointDef.prototype.__class__ = b2WeldJointDef;
b2WeldJointDef.__cache__ = {};
Module['b2WeldJointDef'] = b2WeldJointDef;

b2WeldJointDef.prototype['Initialize'] = b2WeldJointDef.prototype.Initialize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(bodyA, bodyB, anchor) {
  var self = this.ptr;
  if (bodyA && typeof bodyA === 'object') bodyA = bodyA.ptr;
  if (bodyB && typeof bodyB === 'object') bodyB = bodyB.ptr;
  if (anchor && typeof anchor === 'object') anchor = anchor.ptr;
  _emscripten_bind_b2WeldJointDef_Initialize_3(self, bodyA, bodyB, anchor);
};;

  b2WeldJointDef.prototype['get_localAnchorA'] = b2WeldJointDef.prototype.get_localAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WeldJointDef_get_localAnchorA_0(self), b2Vec2);
};
    b2WeldJointDef.prototype['set_localAnchorA'] = b2WeldJointDef.prototype.set_localAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WeldJointDef_set_localAnchorA_1(self, arg0);
};
    Object.defineProperty(b2WeldJointDef.prototype, 'localAnchorA', { get: b2WeldJointDef.prototype.get_localAnchorA, set: b2WeldJointDef.prototype.set_localAnchorA });
  b2WeldJointDef.prototype['get_localAnchorB'] = b2WeldJointDef.prototype.get_localAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WeldJointDef_get_localAnchorB_0(self), b2Vec2);
};
    b2WeldJointDef.prototype['set_localAnchorB'] = b2WeldJointDef.prototype.set_localAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WeldJointDef_set_localAnchorB_1(self, arg0);
};
    Object.defineProperty(b2WeldJointDef.prototype, 'localAnchorB', { get: b2WeldJointDef.prototype.get_localAnchorB, set: b2WeldJointDef.prototype.set_localAnchorB });
  b2WeldJointDef.prototype['get_referenceAngle'] = b2WeldJointDef.prototype.get_referenceAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WeldJointDef_get_referenceAngle_0(self);
};
    b2WeldJointDef.prototype['set_referenceAngle'] = b2WeldJointDef.prototype.set_referenceAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WeldJointDef_set_referenceAngle_1(self, arg0);
};
    Object.defineProperty(b2WeldJointDef.prototype, 'referenceAngle', { get: b2WeldJointDef.prototype.get_referenceAngle, set: b2WeldJointDef.prototype.set_referenceAngle });
  b2WeldJointDef.prototype['get_stiffness'] = b2WeldJointDef.prototype.get_stiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WeldJointDef_get_stiffness_0(self);
};
    b2WeldJointDef.prototype['set_stiffness'] = b2WeldJointDef.prototype.set_stiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WeldJointDef_set_stiffness_1(self, arg0);
};
    Object.defineProperty(b2WeldJointDef.prototype, 'stiffness', { get: b2WeldJointDef.prototype.get_stiffness, set: b2WeldJointDef.prototype.set_stiffness });
  b2WeldJointDef.prototype['get_damping'] = b2WeldJointDef.prototype.get_damping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WeldJointDef_get_damping_0(self);
};
    b2WeldJointDef.prototype['set_damping'] = b2WeldJointDef.prototype.set_damping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WeldJointDef_set_damping_1(self, arg0);
};
    Object.defineProperty(b2WeldJointDef.prototype, 'damping', { get: b2WeldJointDef.prototype.get_damping, set: b2WeldJointDef.prototype.set_damping });
  b2WeldJointDef.prototype['get_type'] = b2WeldJointDef.prototype.get_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WeldJointDef_get_type_0(self);
};
    b2WeldJointDef.prototype['set_type'] = b2WeldJointDef.prototype.set_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WeldJointDef_set_type_1(self, arg0);
};
    Object.defineProperty(b2WeldJointDef.prototype, 'type', { get: b2WeldJointDef.prototype.get_type, set: b2WeldJointDef.prototype.set_type });
  b2WeldJointDef.prototype['get_userData'] = b2WeldJointDef.prototype.get_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WeldJointDef_get_userData_0(self), b2JointUserData);
};
    b2WeldJointDef.prototype['set_userData'] = b2WeldJointDef.prototype.set_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WeldJointDef_set_userData_1(self, arg0);
};
    Object.defineProperty(b2WeldJointDef.prototype, 'userData', { get: b2WeldJointDef.prototype.get_userData, set: b2WeldJointDef.prototype.set_userData });
  b2WeldJointDef.prototype['get_bodyA'] = b2WeldJointDef.prototype.get_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WeldJointDef_get_bodyA_0(self), b2Body);
};
    b2WeldJointDef.prototype['set_bodyA'] = b2WeldJointDef.prototype.set_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WeldJointDef_set_bodyA_1(self, arg0);
};
    Object.defineProperty(b2WeldJointDef.prototype, 'bodyA', { get: b2WeldJointDef.prototype.get_bodyA, set: b2WeldJointDef.prototype.set_bodyA });
  b2WeldJointDef.prototype['get_bodyB'] = b2WeldJointDef.prototype.get_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WeldJointDef_get_bodyB_0(self), b2Body);
};
    b2WeldJointDef.prototype['set_bodyB'] = b2WeldJointDef.prototype.set_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WeldJointDef_set_bodyB_1(self, arg0);
};
    Object.defineProperty(b2WeldJointDef.prototype, 'bodyB', { get: b2WeldJointDef.prototype.get_bodyB, set: b2WeldJointDef.prototype.set_bodyB });
  b2WeldJointDef.prototype['get_collideConnected'] = b2WeldJointDef.prototype.get_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2WeldJointDef_get_collideConnected_0(self));
};
    b2WeldJointDef.prototype['set_collideConnected'] = b2WeldJointDef.prototype.set_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WeldJointDef_set_collideConnected_1(self, arg0);
};
    Object.defineProperty(b2WeldJointDef.prototype, 'collideConnected', { get: b2WeldJointDef.prototype.get_collideConnected, set: b2WeldJointDef.prototype.set_collideConnected });
  b2WeldJointDef.prototype['__destroy__'] = b2WeldJointDef.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2WeldJointDef___destroy___0(self);
};
// b2ChainShape
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2ChainShape() {
  this.ptr = _emscripten_bind_b2ChainShape_b2ChainShape_0();
  getCache(b2ChainShape)[this.ptr] = this;
};;
b2ChainShape.prototype = Object.create(b2Shape.prototype);
b2ChainShape.prototype.constructor = b2ChainShape;
b2ChainShape.prototype.__class__ = b2ChainShape;
b2ChainShape.__cache__ = {};
Module['b2ChainShape'] = b2ChainShape;

b2ChainShape.prototype['Clear'] = b2ChainShape.prototype.Clear = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2ChainShape_Clear_0(self);
};;

b2ChainShape.prototype['CreateLoop'] = b2ChainShape.prototype.CreateLoop = /** @suppress {undefinedVars, duplicate} @this{Object} */function(vertices, count) {
  var self = this.ptr;
  if (vertices && typeof vertices === 'object') vertices = vertices.ptr;
  if (count && typeof count === 'object') count = count.ptr;
  _emscripten_bind_b2ChainShape_CreateLoop_2(self, vertices, count);
};;

b2ChainShape.prototype['CreateChain'] = b2ChainShape.prototype.CreateChain = /** @suppress {undefinedVars, duplicate} @this{Object} */function(vertices, count, prevVertex, nextVertex) {
  var self = this.ptr;
  if (vertices && typeof vertices === 'object') vertices = vertices.ptr;
  if (count && typeof count === 'object') count = count.ptr;
  if (prevVertex && typeof prevVertex === 'object') prevVertex = prevVertex.ptr;
  if (nextVertex && typeof nextVertex === 'object') nextVertex = nextVertex.ptr;
  _emscripten_bind_b2ChainShape_CreateChain_4(self, vertices, count, prevVertex, nextVertex);
};;

b2ChainShape.prototype['GetChildEdge'] = b2ChainShape.prototype.GetChildEdge = /** @suppress {undefinedVars, duplicate} @this{Object} */function(edge, index) {
  var self = this.ptr;
  if (edge && typeof edge === 'object') edge = edge.ptr;
  if (index && typeof index === 'object') index = index.ptr;
  _emscripten_bind_b2ChainShape_GetChildEdge_2(self, edge, index);
};;

b2ChainShape.prototype['GetType'] = b2ChainShape.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2ChainShape_GetType_0(self);
};;

b2ChainShape.prototype['GetChildCount'] = b2ChainShape.prototype.GetChildCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2ChainShape_GetChildCount_0(self);
};;

b2ChainShape.prototype['TestPoint'] = b2ChainShape.prototype.TestPoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(xf, p) {
  var self = this.ptr;
  if (xf && typeof xf === 'object') xf = xf.ptr;
  if (p && typeof p === 'object') p = p.ptr;
  return !!(_emscripten_bind_b2ChainShape_TestPoint_2(self, xf, p));
};;

b2ChainShape.prototype['RayCast'] = b2ChainShape.prototype.RayCast = /** @suppress {undefinedVars, duplicate} @this{Object} */function(output, input, transform, childIndex) {
  var self = this.ptr;
  if (output && typeof output === 'object') output = output.ptr;
  if (input && typeof input === 'object') input = input.ptr;
  if (transform && typeof transform === 'object') transform = transform.ptr;
  if (childIndex && typeof childIndex === 'object') childIndex = childIndex.ptr;
  return !!(_emscripten_bind_b2ChainShape_RayCast_4(self, output, input, transform, childIndex));
};;

b2ChainShape.prototype['ComputeAABB'] = b2ChainShape.prototype.ComputeAABB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(aabb, xf, childIndex) {
  var self = this.ptr;
  if (aabb && typeof aabb === 'object') aabb = aabb.ptr;
  if (xf && typeof xf === 'object') xf = xf.ptr;
  if (childIndex && typeof childIndex === 'object') childIndex = childIndex.ptr;
  _emscripten_bind_b2ChainShape_ComputeAABB_3(self, aabb, xf, childIndex);
};;

b2ChainShape.prototype['ComputeMass'] = b2ChainShape.prototype.ComputeMass = /** @suppress {undefinedVars, duplicate} @this{Object} */function(massData, density) {
  var self = this.ptr;
  if (massData && typeof massData === 'object') massData = massData.ptr;
  if (density && typeof density === 'object') density = density.ptr;
  _emscripten_bind_b2ChainShape_ComputeMass_2(self, massData, density);
};;

  b2ChainShape.prototype['get_m_vertices'] = b2ChainShape.prototype.get_m_vertices = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2ChainShape_get_m_vertices_0(self), b2Vec2);
};
    b2ChainShape.prototype['set_m_vertices'] = b2ChainShape.prototype.set_m_vertices = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ChainShape_set_m_vertices_1(self, arg0);
};
    Object.defineProperty(b2ChainShape.prototype, 'm_vertices', { get: b2ChainShape.prototype.get_m_vertices, set: b2ChainShape.prototype.set_m_vertices });
  b2ChainShape.prototype['get_m_count'] = b2ChainShape.prototype.get_m_count = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2ChainShape_get_m_count_0(self);
};
    b2ChainShape.prototype['set_m_count'] = b2ChainShape.prototype.set_m_count = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ChainShape_set_m_count_1(self, arg0);
};
    Object.defineProperty(b2ChainShape.prototype, 'm_count', { get: b2ChainShape.prototype.get_m_count, set: b2ChainShape.prototype.set_m_count });
  b2ChainShape.prototype['get_m_prevVertex'] = b2ChainShape.prototype.get_m_prevVertex = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2ChainShape_get_m_prevVertex_0(self), b2Vec2);
};
    b2ChainShape.prototype['set_m_prevVertex'] = b2ChainShape.prototype.set_m_prevVertex = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ChainShape_set_m_prevVertex_1(self, arg0);
};
    Object.defineProperty(b2ChainShape.prototype, 'm_prevVertex', { get: b2ChainShape.prototype.get_m_prevVertex, set: b2ChainShape.prototype.set_m_prevVertex });
  b2ChainShape.prototype['get_m_nextVertex'] = b2ChainShape.prototype.get_m_nextVertex = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2ChainShape_get_m_nextVertex_0(self), b2Vec2);
};
    b2ChainShape.prototype['set_m_nextVertex'] = b2ChainShape.prototype.set_m_nextVertex = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ChainShape_set_m_nextVertex_1(self, arg0);
};
    Object.defineProperty(b2ChainShape.prototype, 'm_nextVertex', { get: b2ChainShape.prototype.get_m_nextVertex, set: b2ChainShape.prototype.set_m_nextVertex });
  b2ChainShape.prototype['get_m_type'] = b2ChainShape.prototype.get_m_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2ChainShape_get_m_type_0(self);
};
    b2ChainShape.prototype['set_m_type'] = b2ChainShape.prototype.set_m_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ChainShape_set_m_type_1(self, arg0);
};
    Object.defineProperty(b2ChainShape.prototype, 'm_type', { get: b2ChainShape.prototype.get_m_type, set: b2ChainShape.prototype.set_m_type });
  b2ChainShape.prototype['get_m_radius'] = b2ChainShape.prototype.get_m_radius = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2ChainShape_get_m_radius_0(self);
};
    b2ChainShape.prototype['set_m_radius'] = b2ChainShape.prototype.set_m_radius = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ChainShape_set_m_radius_1(self, arg0);
};
    Object.defineProperty(b2ChainShape.prototype, 'm_radius', { get: b2ChainShape.prototype.get_m_radius, set: b2ChainShape.prototype.set_m_radius });
  b2ChainShape.prototype['__destroy__'] = b2ChainShape.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2ChainShape___destroy___0(self);
};
// b2Color
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Color(r, g, b) {
  if (r && typeof r === 'object') r = r.ptr;
  if (g && typeof g === 'object') g = g.ptr;
  if (b && typeof b === 'object') b = b.ptr;
  if (r === undefined) { this.ptr = _emscripten_bind_b2Color_b2Color_0(); getCache(b2Color)[this.ptr] = this;return }
  if (g === undefined) { this.ptr = _emscripten_bind_b2Color_b2Color_1(r); getCache(b2Color)[this.ptr] = this;return }
  if (b === undefined) { this.ptr = _emscripten_bind_b2Color_b2Color_2(r, g); getCache(b2Color)[this.ptr] = this;return }
  this.ptr = _emscripten_bind_b2Color_b2Color_3(r, g, b);
  getCache(b2Color)[this.ptr] = this;
};;
b2Color.prototype = Object.create(WrapperObject.prototype);
b2Color.prototype.constructor = b2Color;
b2Color.prototype.__class__ = b2Color;
b2Color.__cache__ = {};
Module['b2Color'] = b2Color;

b2Color.prototype['Set'] = b2Color.prototype.Set = /** @suppress {undefinedVars, duplicate} @this{Object} */function(ri, gi, bi) {
  var self = this.ptr;
  if (ri && typeof ri === 'object') ri = ri.ptr;
  if (gi && typeof gi === 'object') gi = gi.ptr;
  if (bi && typeof bi === 'object') bi = bi.ptr;
  _emscripten_bind_b2Color_Set_3(self, ri, gi, bi);
};;

  b2Color.prototype['get_r'] = b2Color.prototype.get_r = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Color_get_r_0(self);
};
    b2Color.prototype['set_r'] = b2Color.prototype.set_r = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Color_set_r_1(self, arg0);
};
    Object.defineProperty(b2Color.prototype, 'r', { get: b2Color.prototype.get_r, set: b2Color.prototype.set_r });
  b2Color.prototype['get_g'] = b2Color.prototype.get_g = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Color_get_g_0(self);
};
    b2Color.prototype['set_g'] = b2Color.prototype.set_g = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Color_set_g_1(self, arg0);
};
    Object.defineProperty(b2Color.prototype, 'g', { get: b2Color.prototype.get_g, set: b2Color.prototype.set_g });
  b2Color.prototype['get_b'] = b2Color.prototype.get_b = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Color_get_b_0(self);
};
    b2Color.prototype['set_b'] = b2Color.prototype.set_b = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Color_set_b_1(self, arg0);
};
    Object.defineProperty(b2Color.prototype, 'b', { get: b2Color.prototype.get_b, set: b2Color.prototype.set_b });
  b2Color.prototype['__destroy__'] = b2Color.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Color___destroy___0(self);
};
// b2ContactEdge
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2ContactEdge() {
  this.ptr = _emscripten_bind_b2ContactEdge_b2ContactEdge_0();
  getCache(b2ContactEdge)[this.ptr] = this;
};;
b2ContactEdge.prototype = Object.create(WrapperObject.prototype);
b2ContactEdge.prototype.constructor = b2ContactEdge;
b2ContactEdge.prototype.__class__ = b2ContactEdge;
b2ContactEdge.__cache__ = {};
Module['b2ContactEdge'] = b2ContactEdge;

  b2ContactEdge.prototype['get_other'] = b2ContactEdge.prototype.get_other = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2ContactEdge_get_other_0(self), b2Body);
};
    b2ContactEdge.prototype['set_other'] = b2ContactEdge.prototype.set_other = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ContactEdge_set_other_1(self, arg0);
};
    Object.defineProperty(b2ContactEdge.prototype, 'other', { get: b2ContactEdge.prototype.get_other, set: b2ContactEdge.prototype.set_other });
  b2ContactEdge.prototype['get_contact'] = b2ContactEdge.prototype.get_contact = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2ContactEdge_get_contact_0(self), b2Contact);
};
    b2ContactEdge.prototype['set_contact'] = b2ContactEdge.prototype.set_contact = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ContactEdge_set_contact_1(self, arg0);
};
    Object.defineProperty(b2ContactEdge.prototype, 'contact', { get: b2ContactEdge.prototype.get_contact, set: b2ContactEdge.prototype.set_contact });
  b2ContactEdge.prototype['get_prev'] = b2ContactEdge.prototype.get_prev = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2ContactEdge_get_prev_0(self), b2ContactEdge);
};
    b2ContactEdge.prototype['set_prev'] = b2ContactEdge.prototype.set_prev = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ContactEdge_set_prev_1(self, arg0);
};
    Object.defineProperty(b2ContactEdge.prototype, 'prev', { get: b2ContactEdge.prototype.get_prev, set: b2ContactEdge.prototype.set_prev });
  b2ContactEdge.prototype['get_next'] = b2ContactEdge.prototype.get_next = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2ContactEdge_get_next_0(self), b2ContactEdge);
};
    b2ContactEdge.prototype['set_next'] = b2ContactEdge.prototype.set_next = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ContactEdge_set_next_1(self, arg0);
};
    Object.defineProperty(b2ContactEdge.prototype, 'next', { get: b2ContactEdge.prototype.get_next, set: b2ContactEdge.prototype.set_next });
  b2ContactEdge.prototype['__destroy__'] = b2ContactEdge.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2ContactEdge___destroy___0(self);
};
// b2ContactFeature
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2ContactFeature() { throw "cannot construct a b2ContactFeature, no constructor in IDL" }
b2ContactFeature.prototype = Object.create(WrapperObject.prototype);
b2ContactFeature.prototype.constructor = b2ContactFeature;
b2ContactFeature.prototype.__class__ = b2ContactFeature;
b2ContactFeature.__cache__ = {};
Module['b2ContactFeature'] = b2ContactFeature;

  b2ContactFeature.prototype['get_indexA'] = b2ContactFeature.prototype.get_indexA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2ContactFeature_get_indexA_0(self);
};
    b2ContactFeature.prototype['set_indexA'] = b2ContactFeature.prototype.set_indexA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ContactFeature_set_indexA_1(self, arg0);
};
    Object.defineProperty(b2ContactFeature.prototype, 'indexA', { get: b2ContactFeature.prototype.get_indexA, set: b2ContactFeature.prototype.set_indexA });
  b2ContactFeature.prototype['get_indexB'] = b2ContactFeature.prototype.get_indexB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2ContactFeature_get_indexB_0(self);
};
    b2ContactFeature.prototype['set_indexB'] = b2ContactFeature.prototype.set_indexB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ContactFeature_set_indexB_1(self, arg0);
};
    Object.defineProperty(b2ContactFeature.prototype, 'indexB', { get: b2ContactFeature.prototype.get_indexB, set: b2ContactFeature.prototype.set_indexB });
  b2ContactFeature.prototype['get_typeA'] = b2ContactFeature.prototype.get_typeA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2ContactFeature_get_typeA_0(self);
};
    b2ContactFeature.prototype['set_typeA'] = b2ContactFeature.prototype.set_typeA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ContactFeature_set_typeA_1(self, arg0);
};
    Object.defineProperty(b2ContactFeature.prototype, 'typeA', { get: b2ContactFeature.prototype.get_typeA, set: b2ContactFeature.prototype.set_typeA });
  b2ContactFeature.prototype['get_typeB'] = b2ContactFeature.prototype.get_typeB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2ContactFeature_get_typeB_0(self);
};
    b2ContactFeature.prototype['set_typeB'] = b2ContactFeature.prototype.set_typeB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ContactFeature_set_typeB_1(self, arg0);
};
    Object.defineProperty(b2ContactFeature.prototype, 'typeB', { get: b2ContactFeature.prototype.get_typeB, set: b2ContactFeature.prototype.set_typeB });
  b2ContactFeature.prototype['__destroy__'] = b2ContactFeature.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2ContactFeature___destroy___0(self);
};
// JSContactFilter
/** @suppress {undefinedVars, duplicate} @this{Object} */function JSContactFilter() {
  this.ptr = _emscripten_bind_JSContactFilter_JSContactFilter_0();
  getCache(JSContactFilter)[this.ptr] = this;
};;
JSContactFilter.prototype = Object.create(b2ContactFilter.prototype);
JSContactFilter.prototype.constructor = JSContactFilter;
JSContactFilter.prototype.__class__ = JSContactFilter;
JSContactFilter.__cache__ = {};
Module['JSContactFilter'] = JSContactFilter;

JSContactFilter.prototype['ShouldCollide'] = JSContactFilter.prototype.ShouldCollide = /** @suppress {undefinedVars, duplicate} @this{Object} */function(fixtureA, fixtureB) {
  var self = this.ptr;
  if (fixtureA && typeof fixtureA === 'object') fixtureA = fixtureA.ptr;
  if (fixtureB && typeof fixtureB === 'object') fixtureB = fixtureB.ptr;
  return !!(_emscripten_bind_JSContactFilter_ShouldCollide_2(self, fixtureA, fixtureB));
};;

  JSContactFilter.prototype['__destroy__'] = JSContactFilter.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_JSContactFilter___destroy___0(self);
};
// b2ContactID
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2ContactID() { throw "cannot construct a b2ContactID, no constructor in IDL" }
b2ContactID.prototype = Object.create(WrapperObject.prototype);
b2ContactID.prototype.constructor = b2ContactID;
b2ContactID.prototype.__class__ = b2ContactID;
b2ContactID.__cache__ = {};
Module['b2ContactID'] = b2ContactID;

  b2ContactID.prototype['get_cf'] = b2ContactID.prototype.get_cf = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2ContactID_get_cf_0(self), b2ContactFeature);
};
    b2ContactID.prototype['set_cf'] = b2ContactID.prototype.set_cf = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ContactID_set_cf_1(self, arg0);
};
    Object.defineProperty(b2ContactID.prototype, 'cf', { get: b2ContactID.prototype.get_cf, set: b2ContactID.prototype.set_cf });
  b2ContactID.prototype['get_key'] = b2ContactID.prototype.get_key = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2ContactID_get_key_0(self);
};
    b2ContactID.prototype['set_key'] = b2ContactID.prototype.set_key = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ContactID_set_key_1(self, arg0);
};
    Object.defineProperty(b2ContactID.prototype, 'key', { get: b2ContactID.prototype.get_key, set: b2ContactID.prototype.set_key });
  b2ContactID.prototype['__destroy__'] = b2ContactID.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2ContactID___destroy___0(self);
};
// b2ContactImpulse
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2ContactImpulse() { throw "cannot construct a b2ContactImpulse, no constructor in IDL" }
b2ContactImpulse.prototype = Object.create(WrapperObject.prototype);
b2ContactImpulse.prototype.constructor = b2ContactImpulse;
b2ContactImpulse.prototype.__class__ = b2ContactImpulse;
b2ContactImpulse.__cache__ = {};
Module['b2ContactImpulse'] = b2ContactImpulse;

  b2ContactImpulse.prototype['get_normalImpulses'] = b2ContactImpulse.prototype.get_normalImpulses = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  return _emscripten_bind_b2ContactImpulse_get_normalImpulses_1(self, arg0);
};
    b2ContactImpulse.prototype['set_normalImpulses'] = b2ContactImpulse.prototype.set_normalImpulses = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0, arg1) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  if (arg1 && typeof arg1 === 'object') arg1 = arg1.ptr;
  _emscripten_bind_b2ContactImpulse_set_normalImpulses_2(self, arg0, arg1);
};
    Object.defineProperty(b2ContactImpulse.prototype, 'normalImpulses', { get: b2ContactImpulse.prototype.get_normalImpulses, set: b2ContactImpulse.prototype.set_normalImpulses });
  b2ContactImpulse.prototype['get_tangentImpulses'] = b2ContactImpulse.prototype.get_tangentImpulses = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  return _emscripten_bind_b2ContactImpulse_get_tangentImpulses_1(self, arg0);
};
    b2ContactImpulse.prototype['set_tangentImpulses'] = b2ContactImpulse.prototype.set_tangentImpulses = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0, arg1) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  if (arg1 && typeof arg1 === 'object') arg1 = arg1.ptr;
  _emscripten_bind_b2ContactImpulse_set_tangentImpulses_2(self, arg0, arg1);
};
    Object.defineProperty(b2ContactImpulse.prototype, 'tangentImpulses', { get: b2ContactImpulse.prototype.get_tangentImpulses, set: b2ContactImpulse.prototype.set_tangentImpulses });
  b2ContactImpulse.prototype['get_count'] = b2ContactImpulse.prototype.get_count = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2ContactImpulse_get_count_0(self);
};
    b2ContactImpulse.prototype['set_count'] = b2ContactImpulse.prototype.set_count = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ContactImpulse_set_count_1(self, arg0);
};
    Object.defineProperty(b2ContactImpulse.prototype, 'count', { get: b2ContactImpulse.prototype.get_count, set: b2ContactImpulse.prototype.set_count });
  b2ContactImpulse.prototype['__destroy__'] = b2ContactImpulse.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2ContactImpulse___destroy___0(self);
};
// b2DestructionListener
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2DestructionListener() { throw "cannot construct a b2DestructionListener, no constructor in IDL" }
b2DestructionListener.prototype = Object.create(WrapperObject.prototype);
b2DestructionListener.prototype.constructor = b2DestructionListener;
b2DestructionListener.prototype.__class__ = b2DestructionListener;
b2DestructionListener.__cache__ = {};
Module['b2DestructionListener'] = b2DestructionListener;

  b2DestructionListener.prototype['__destroy__'] = b2DestructionListener.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2DestructionListener___destroy___0(self);
};
// JSDestructionListener
/** @suppress {undefinedVars, duplicate} @this{Object} */function JSDestructionListener() {
  this.ptr = _emscripten_bind_JSDestructionListener_JSDestructionListener_0();
  getCache(JSDestructionListener)[this.ptr] = this;
};;
JSDestructionListener.prototype = Object.create(b2DestructionListenerWrapper.prototype);
JSDestructionListener.prototype.constructor = JSDestructionListener;
JSDestructionListener.prototype.__class__ = JSDestructionListener;
JSDestructionListener.__cache__ = {};
Module['JSDestructionListener'] = JSDestructionListener;

JSDestructionListener.prototype['SayGoodbyeJoint'] = JSDestructionListener.prototype.SayGoodbyeJoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(joint) {
  var self = this.ptr;
  if (joint && typeof joint === 'object') joint = joint.ptr;
  _emscripten_bind_JSDestructionListener_SayGoodbyeJoint_1(self, joint);
};;

JSDestructionListener.prototype['SayGoodbyeFixture'] = JSDestructionListener.prototype.SayGoodbyeFixture = /** @suppress {undefinedVars, duplicate} @this{Object} */function(joint) {
  var self = this.ptr;
  if (joint && typeof joint === 'object') joint = joint.ptr;
  _emscripten_bind_JSDestructionListener_SayGoodbyeFixture_1(self, joint);
};;

  JSDestructionListener.prototype['__destroy__'] = JSDestructionListener.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_JSDestructionListener___destroy___0(self);
};
// b2DistanceJoint
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2DistanceJoint() { throw "cannot construct a b2DistanceJoint, no constructor in IDL" }
b2DistanceJoint.prototype = Object.create(b2Joint.prototype);
b2DistanceJoint.prototype.constructor = b2DistanceJoint;
b2DistanceJoint.prototype.__class__ = b2DistanceJoint;
b2DistanceJoint.__cache__ = {};
Module['b2DistanceJoint'] = b2DistanceJoint;

b2DistanceJoint.prototype['GetLocalAnchorA'] = b2DistanceJoint.prototype.GetLocalAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2DistanceJoint_GetLocalAnchorA_0(self), b2Vec2);
};;

b2DistanceJoint.prototype['GetLocalAnchorB'] = b2DistanceJoint.prototype.GetLocalAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2DistanceJoint_GetLocalAnchorB_0(self), b2Vec2);
};;

b2DistanceJoint.prototype['GetLength'] = b2DistanceJoint.prototype.GetLength = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2DistanceJoint_GetLength_0(self);
};;

b2DistanceJoint.prototype['SetLength'] = b2DistanceJoint.prototype.SetLength = /** @suppress {undefinedVars, duplicate} @this{Object} */function(length) {
  var self = this.ptr;
  if (length && typeof length === 'object') length = length.ptr;
  _emscripten_bind_b2DistanceJoint_SetLength_1(self, length);
};;

b2DistanceJoint.prototype['GetMinLength'] = b2DistanceJoint.prototype.GetMinLength = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2DistanceJoint_GetMinLength_0(self);
};;

b2DistanceJoint.prototype['SetMinLength'] = b2DistanceJoint.prototype.SetMinLength = /** @suppress {undefinedVars, duplicate} @this{Object} */function(minLength) {
  var self = this.ptr;
  if (minLength && typeof minLength === 'object') minLength = minLength.ptr;
  _emscripten_bind_b2DistanceJoint_SetMinLength_1(self, minLength);
};;

b2DistanceJoint.prototype['GetMaxLength'] = b2DistanceJoint.prototype.GetMaxLength = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2DistanceJoint_GetMaxLength_0(self);
};;

b2DistanceJoint.prototype['SetMaxLength'] = b2DistanceJoint.prototype.SetMaxLength = /** @suppress {undefinedVars, duplicate} @this{Object} */function(maxLength) {
  var self = this.ptr;
  if (maxLength && typeof maxLength === 'object') maxLength = maxLength.ptr;
  _emscripten_bind_b2DistanceJoint_SetMaxLength_1(self, maxLength);
};;

b2DistanceJoint.prototype['GetCurrentLength'] = b2DistanceJoint.prototype.GetCurrentLength = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2DistanceJoint_GetCurrentLength_0(self);
};;

b2DistanceJoint.prototype['SetStiffness'] = b2DistanceJoint.prototype.SetStiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function(stiffness) {
  var self = this.ptr;
  if (stiffness && typeof stiffness === 'object') stiffness = stiffness.ptr;
  _emscripten_bind_b2DistanceJoint_SetStiffness_1(self, stiffness);
};;

b2DistanceJoint.prototype['GetStiffness'] = b2DistanceJoint.prototype.GetStiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2DistanceJoint_GetStiffness_0(self);
};;

b2DistanceJoint.prototype['SetDamping'] = b2DistanceJoint.prototype.SetDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(damping) {
  var self = this.ptr;
  if (damping && typeof damping === 'object') damping = damping.ptr;
  _emscripten_bind_b2DistanceJoint_SetDamping_1(self, damping);
};;

b2DistanceJoint.prototype['GetDamping'] = b2DistanceJoint.prototype.GetDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2DistanceJoint_GetDamping_0(self);
};;

b2DistanceJoint.prototype['GetType'] = b2DistanceJoint.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2DistanceJoint_GetType_0(self);
};;

b2DistanceJoint.prototype['GetBodyA'] = b2DistanceJoint.prototype.GetBodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2DistanceJoint_GetBodyA_0(self), b2Body);
};;

b2DistanceJoint.prototype['GetBodyB'] = b2DistanceJoint.prototype.GetBodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2DistanceJoint_GetBodyB_0(self), b2Body);
};;

b2DistanceJoint.prototype['GetAnchorA'] = b2DistanceJoint.prototype.GetAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2DistanceJoint_GetAnchorA_0(self), b2Vec2);
};;

b2DistanceJoint.prototype['GetAnchorB'] = b2DistanceJoint.prototype.GetAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2DistanceJoint_GetAnchorB_0(self), b2Vec2);
};;

b2DistanceJoint.prototype['GetReactionForce'] = b2DistanceJoint.prototype.GetReactionForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return wrapPointer(_emscripten_bind_b2DistanceJoint_GetReactionForce_1(self, inv_dt), b2Vec2);
};;

b2DistanceJoint.prototype['GetReactionTorque'] = b2DistanceJoint.prototype.GetReactionTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return _emscripten_bind_b2DistanceJoint_GetReactionTorque_1(self, inv_dt);
};;

b2DistanceJoint.prototype['GetNext'] = b2DistanceJoint.prototype.GetNext = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2DistanceJoint_GetNext_0(self), b2Joint);
};;

b2DistanceJoint.prototype['GetUserData'] = b2DistanceJoint.prototype.GetUserData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2DistanceJoint_GetUserData_0(self), b2JointUserData);
};;

b2DistanceJoint.prototype['GetCollideConnected'] = b2DistanceJoint.prototype.GetCollideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2DistanceJoint_GetCollideConnected_0(self));
};;

  b2DistanceJoint.prototype['__destroy__'] = b2DistanceJoint.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2DistanceJoint___destroy___0(self);
};
// b2DistanceJointDef
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2DistanceJointDef() {
  this.ptr = _emscripten_bind_b2DistanceJointDef_b2DistanceJointDef_0();
  getCache(b2DistanceJointDef)[this.ptr] = this;
};;
b2DistanceJointDef.prototype = Object.create(b2JointDef.prototype);
b2DistanceJointDef.prototype.constructor = b2DistanceJointDef;
b2DistanceJointDef.prototype.__class__ = b2DistanceJointDef;
b2DistanceJointDef.__cache__ = {};
Module['b2DistanceJointDef'] = b2DistanceJointDef;

b2DistanceJointDef.prototype['Initialize'] = b2DistanceJointDef.prototype.Initialize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(bodyA, bodyB, anchorA, anchorB) {
  var self = this.ptr;
  if (bodyA && typeof bodyA === 'object') bodyA = bodyA.ptr;
  if (bodyB && typeof bodyB === 'object') bodyB = bodyB.ptr;
  if (anchorA && typeof anchorA === 'object') anchorA = anchorA.ptr;
  if (anchorB && typeof anchorB === 'object') anchorB = anchorB.ptr;
  _emscripten_bind_b2DistanceJointDef_Initialize_4(self, bodyA, bodyB, anchorA, anchorB);
};;

  b2DistanceJointDef.prototype['get_localAnchorA'] = b2DistanceJointDef.prototype.get_localAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2DistanceJointDef_get_localAnchorA_0(self), b2Vec2);
};
    b2DistanceJointDef.prototype['set_localAnchorA'] = b2DistanceJointDef.prototype.set_localAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2DistanceJointDef_set_localAnchorA_1(self, arg0);
};
    Object.defineProperty(b2DistanceJointDef.prototype, 'localAnchorA', { get: b2DistanceJointDef.prototype.get_localAnchorA, set: b2DistanceJointDef.prototype.set_localAnchorA });
  b2DistanceJointDef.prototype['get_localAnchorB'] = b2DistanceJointDef.prototype.get_localAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2DistanceJointDef_get_localAnchorB_0(self), b2Vec2);
};
    b2DistanceJointDef.prototype['set_localAnchorB'] = b2DistanceJointDef.prototype.set_localAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2DistanceJointDef_set_localAnchorB_1(self, arg0);
};
    Object.defineProperty(b2DistanceJointDef.prototype, 'localAnchorB', { get: b2DistanceJointDef.prototype.get_localAnchorB, set: b2DistanceJointDef.prototype.set_localAnchorB });
  b2DistanceJointDef.prototype['get_length'] = b2DistanceJointDef.prototype.get_length = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2DistanceJointDef_get_length_0(self);
};
    b2DistanceJointDef.prototype['set_length'] = b2DistanceJointDef.prototype.set_length = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2DistanceJointDef_set_length_1(self, arg0);
};
    Object.defineProperty(b2DistanceJointDef.prototype, 'length', { get: b2DistanceJointDef.prototype.get_length, set: b2DistanceJointDef.prototype.set_length });
  b2DistanceJointDef.prototype['get_minLength'] = b2DistanceJointDef.prototype.get_minLength = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2DistanceJointDef_get_minLength_0(self);
};
    b2DistanceJointDef.prototype['set_minLength'] = b2DistanceJointDef.prototype.set_minLength = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2DistanceJointDef_set_minLength_1(self, arg0);
};
    Object.defineProperty(b2DistanceJointDef.prototype, 'minLength', { get: b2DistanceJointDef.prototype.get_minLength, set: b2DistanceJointDef.prototype.set_minLength });
  b2DistanceJointDef.prototype['get_maxLength'] = b2DistanceJointDef.prototype.get_maxLength = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2DistanceJointDef_get_maxLength_0(self);
};
    b2DistanceJointDef.prototype['set_maxLength'] = b2DistanceJointDef.prototype.set_maxLength = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2DistanceJointDef_set_maxLength_1(self, arg0);
};
    Object.defineProperty(b2DistanceJointDef.prototype, 'maxLength', { get: b2DistanceJointDef.prototype.get_maxLength, set: b2DistanceJointDef.prototype.set_maxLength });
  b2DistanceJointDef.prototype['get_stiffness'] = b2DistanceJointDef.prototype.get_stiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2DistanceJointDef_get_stiffness_0(self);
};
    b2DistanceJointDef.prototype['set_stiffness'] = b2DistanceJointDef.prototype.set_stiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2DistanceJointDef_set_stiffness_1(self, arg0);
};
    Object.defineProperty(b2DistanceJointDef.prototype, 'stiffness', { get: b2DistanceJointDef.prototype.get_stiffness, set: b2DistanceJointDef.prototype.set_stiffness });
  b2DistanceJointDef.prototype['get_damping'] = b2DistanceJointDef.prototype.get_damping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2DistanceJointDef_get_damping_0(self);
};
    b2DistanceJointDef.prototype['set_damping'] = b2DistanceJointDef.prototype.set_damping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2DistanceJointDef_set_damping_1(self, arg0);
};
    Object.defineProperty(b2DistanceJointDef.prototype, 'damping', { get: b2DistanceJointDef.prototype.get_damping, set: b2DistanceJointDef.prototype.set_damping });
  b2DistanceJointDef.prototype['get_type'] = b2DistanceJointDef.prototype.get_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2DistanceJointDef_get_type_0(self);
};
    b2DistanceJointDef.prototype['set_type'] = b2DistanceJointDef.prototype.set_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2DistanceJointDef_set_type_1(self, arg0);
};
    Object.defineProperty(b2DistanceJointDef.prototype, 'type', { get: b2DistanceJointDef.prototype.get_type, set: b2DistanceJointDef.prototype.set_type });
  b2DistanceJointDef.prototype['get_userData'] = b2DistanceJointDef.prototype.get_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2DistanceJointDef_get_userData_0(self), b2JointUserData);
};
    b2DistanceJointDef.prototype['set_userData'] = b2DistanceJointDef.prototype.set_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2DistanceJointDef_set_userData_1(self, arg0);
};
    Object.defineProperty(b2DistanceJointDef.prototype, 'userData', { get: b2DistanceJointDef.prototype.get_userData, set: b2DistanceJointDef.prototype.set_userData });
  b2DistanceJointDef.prototype['get_bodyA'] = b2DistanceJointDef.prototype.get_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2DistanceJointDef_get_bodyA_0(self), b2Body);
};
    b2DistanceJointDef.prototype['set_bodyA'] = b2DistanceJointDef.prototype.set_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2DistanceJointDef_set_bodyA_1(self, arg0);
};
    Object.defineProperty(b2DistanceJointDef.prototype, 'bodyA', { get: b2DistanceJointDef.prototype.get_bodyA, set: b2DistanceJointDef.prototype.set_bodyA });
  b2DistanceJointDef.prototype['get_bodyB'] = b2DistanceJointDef.prototype.get_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2DistanceJointDef_get_bodyB_0(self), b2Body);
};
    b2DistanceJointDef.prototype['set_bodyB'] = b2DistanceJointDef.prototype.set_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2DistanceJointDef_set_bodyB_1(self, arg0);
};
    Object.defineProperty(b2DistanceJointDef.prototype, 'bodyB', { get: b2DistanceJointDef.prototype.get_bodyB, set: b2DistanceJointDef.prototype.set_bodyB });
  b2DistanceJointDef.prototype['get_collideConnected'] = b2DistanceJointDef.prototype.get_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2DistanceJointDef_get_collideConnected_0(self));
};
    b2DistanceJointDef.prototype['set_collideConnected'] = b2DistanceJointDef.prototype.set_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2DistanceJointDef_set_collideConnected_1(self, arg0);
};
    Object.defineProperty(b2DistanceJointDef.prototype, 'collideConnected', { get: b2DistanceJointDef.prototype.get_collideConnected, set: b2DistanceJointDef.prototype.set_collideConnected });
  b2DistanceJointDef.prototype['__destroy__'] = b2DistanceJointDef.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2DistanceJointDef___destroy___0(self);
};
// JSDraw
/** @suppress {undefinedVars, duplicate} @this{Object} */function JSDraw() {
  this.ptr = _emscripten_bind_JSDraw_JSDraw_0();
  getCache(JSDraw)[this.ptr] = this;
};;
JSDraw.prototype = Object.create(b2Draw.prototype);
JSDraw.prototype.constructor = JSDraw;
JSDraw.prototype.__class__ = JSDraw;
JSDraw.__cache__ = {};
Module['JSDraw'] = JSDraw;

JSDraw.prototype['DrawPolygon'] = JSDraw.prototype.DrawPolygon = /** @suppress {undefinedVars, duplicate} @this{Object} */function(vertices, vertexCount, color) {
  var self = this.ptr;
  if (vertices && typeof vertices === 'object') vertices = vertices.ptr;
  if (vertexCount && typeof vertexCount === 'object') vertexCount = vertexCount.ptr;
  if (color && typeof color === 'object') color = color.ptr;
  _emscripten_bind_JSDraw_DrawPolygon_3(self, vertices, vertexCount, color);
};;

JSDraw.prototype['DrawSolidPolygon'] = JSDraw.prototype.DrawSolidPolygon = /** @suppress {undefinedVars, duplicate} @this{Object} */function(vertices, vertexCount, color) {
  var self = this.ptr;
  if (vertices && typeof vertices === 'object') vertices = vertices.ptr;
  if (vertexCount && typeof vertexCount === 'object') vertexCount = vertexCount.ptr;
  if (color && typeof color === 'object') color = color.ptr;
  _emscripten_bind_JSDraw_DrawSolidPolygon_3(self, vertices, vertexCount, color);
};;

JSDraw.prototype['DrawCircle'] = JSDraw.prototype.DrawCircle = /** @suppress {undefinedVars, duplicate} @this{Object} */function(center, radius, color) {
  var self = this.ptr;
  if (center && typeof center === 'object') center = center.ptr;
  if (radius && typeof radius === 'object') radius = radius.ptr;
  if (color && typeof color === 'object') color = color.ptr;
  _emscripten_bind_JSDraw_DrawCircle_3(self, center, radius, color);
};;

JSDraw.prototype['DrawSolidCircle'] = JSDraw.prototype.DrawSolidCircle = /** @suppress {undefinedVars, duplicate} @this{Object} */function(center, radius, axis, color) {
  var self = this.ptr;
  if (center && typeof center === 'object') center = center.ptr;
  if (radius && typeof radius === 'object') radius = radius.ptr;
  if (axis && typeof axis === 'object') axis = axis.ptr;
  if (color && typeof color === 'object') color = color.ptr;
  _emscripten_bind_JSDraw_DrawSolidCircle_4(self, center, radius, axis, color);
};;

JSDraw.prototype['DrawSegment'] = JSDraw.prototype.DrawSegment = /** @suppress {undefinedVars, duplicate} @this{Object} */function(p1, p2, color) {
  var self = this.ptr;
  if (p1 && typeof p1 === 'object') p1 = p1.ptr;
  if (p2 && typeof p2 === 'object') p2 = p2.ptr;
  if (color && typeof color === 'object') color = color.ptr;
  _emscripten_bind_JSDraw_DrawSegment_3(self, p1, p2, color);
};;

JSDraw.prototype['DrawTransform'] = JSDraw.prototype.DrawTransform = /** @suppress {undefinedVars, duplicate} @this{Object} */function(xf) {
  var self = this.ptr;
  if (xf && typeof xf === 'object') xf = xf.ptr;
  _emscripten_bind_JSDraw_DrawTransform_1(self, xf);
};;

JSDraw.prototype['DrawPoint'] = JSDraw.prototype.DrawPoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(p, size, color) {
  var self = this.ptr;
  if (p && typeof p === 'object') p = p.ptr;
  if (size && typeof size === 'object') size = size.ptr;
  if (color && typeof color === 'object') color = color.ptr;
  _emscripten_bind_JSDraw_DrawPoint_3(self, p, size, color);
};;

  JSDraw.prototype['__destroy__'] = JSDraw.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_JSDraw___destroy___0(self);
};
// b2FrictionJoint
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2FrictionJoint() { throw "cannot construct a b2FrictionJoint, no constructor in IDL" }
b2FrictionJoint.prototype = Object.create(b2Joint.prototype);
b2FrictionJoint.prototype.constructor = b2FrictionJoint;
b2FrictionJoint.prototype.__class__ = b2FrictionJoint;
b2FrictionJoint.__cache__ = {};
Module['b2FrictionJoint'] = b2FrictionJoint;

b2FrictionJoint.prototype['GetLocalAnchorA'] = b2FrictionJoint.prototype.GetLocalAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2FrictionJoint_GetLocalAnchorA_0(self), b2Vec2);
};;

b2FrictionJoint.prototype['GetLocalAnchorB'] = b2FrictionJoint.prototype.GetLocalAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2FrictionJoint_GetLocalAnchorB_0(self), b2Vec2);
};;

b2FrictionJoint.prototype['SetMaxForce'] = b2FrictionJoint.prototype.SetMaxForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(force) {
  var self = this.ptr;
  if (force && typeof force === 'object') force = force.ptr;
  _emscripten_bind_b2FrictionJoint_SetMaxForce_1(self, force);
};;

b2FrictionJoint.prototype['GetMaxForce'] = b2FrictionJoint.prototype.GetMaxForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2FrictionJoint_GetMaxForce_0(self);
};;

b2FrictionJoint.prototype['SetMaxTorque'] = b2FrictionJoint.prototype.SetMaxTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(torque) {
  var self = this.ptr;
  if (torque && typeof torque === 'object') torque = torque.ptr;
  _emscripten_bind_b2FrictionJoint_SetMaxTorque_1(self, torque);
};;

b2FrictionJoint.prototype['GetMaxTorque'] = b2FrictionJoint.prototype.GetMaxTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2FrictionJoint_GetMaxTorque_0(self);
};;

b2FrictionJoint.prototype['GetType'] = b2FrictionJoint.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2FrictionJoint_GetType_0(self);
};;

b2FrictionJoint.prototype['GetBodyA'] = b2FrictionJoint.prototype.GetBodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2FrictionJoint_GetBodyA_0(self), b2Body);
};;

b2FrictionJoint.prototype['GetBodyB'] = b2FrictionJoint.prototype.GetBodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2FrictionJoint_GetBodyB_0(self), b2Body);
};;

b2FrictionJoint.prototype['GetAnchorA'] = b2FrictionJoint.prototype.GetAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2FrictionJoint_GetAnchorA_0(self), b2Vec2);
};;

b2FrictionJoint.prototype['GetAnchorB'] = b2FrictionJoint.prototype.GetAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2FrictionJoint_GetAnchorB_0(self), b2Vec2);
};;

b2FrictionJoint.prototype['GetReactionForce'] = b2FrictionJoint.prototype.GetReactionForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return wrapPointer(_emscripten_bind_b2FrictionJoint_GetReactionForce_1(self, inv_dt), b2Vec2);
};;

b2FrictionJoint.prototype['GetReactionTorque'] = b2FrictionJoint.prototype.GetReactionTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return _emscripten_bind_b2FrictionJoint_GetReactionTorque_1(self, inv_dt);
};;

b2FrictionJoint.prototype['GetNext'] = b2FrictionJoint.prototype.GetNext = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2FrictionJoint_GetNext_0(self), b2Joint);
};;

b2FrictionJoint.prototype['GetUserData'] = b2FrictionJoint.prototype.GetUserData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2FrictionJoint_GetUserData_0(self), b2JointUserData);
};;

b2FrictionJoint.prototype['GetCollideConnected'] = b2FrictionJoint.prototype.GetCollideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2FrictionJoint_GetCollideConnected_0(self));
};;

  b2FrictionJoint.prototype['__destroy__'] = b2FrictionJoint.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2FrictionJoint___destroy___0(self);
};
// b2FrictionJointDef
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2FrictionJointDef() {
  this.ptr = _emscripten_bind_b2FrictionJointDef_b2FrictionJointDef_0();
  getCache(b2FrictionJointDef)[this.ptr] = this;
};;
b2FrictionJointDef.prototype = Object.create(b2JointDef.prototype);
b2FrictionJointDef.prototype.constructor = b2FrictionJointDef;
b2FrictionJointDef.prototype.__class__ = b2FrictionJointDef;
b2FrictionJointDef.__cache__ = {};
Module['b2FrictionJointDef'] = b2FrictionJointDef;

b2FrictionJointDef.prototype['Initialize'] = b2FrictionJointDef.prototype.Initialize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(bodyA, bodyB, anchor) {
  var self = this.ptr;
  if (bodyA && typeof bodyA === 'object') bodyA = bodyA.ptr;
  if (bodyB && typeof bodyB === 'object') bodyB = bodyB.ptr;
  if (anchor && typeof anchor === 'object') anchor = anchor.ptr;
  _emscripten_bind_b2FrictionJointDef_Initialize_3(self, bodyA, bodyB, anchor);
};;

  b2FrictionJointDef.prototype['get_localAnchorA'] = b2FrictionJointDef.prototype.get_localAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2FrictionJointDef_get_localAnchorA_0(self), b2Vec2);
};
    b2FrictionJointDef.prototype['set_localAnchorA'] = b2FrictionJointDef.prototype.set_localAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FrictionJointDef_set_localAnchorA_1(self, arg0);
};
    Object.defineProperty(b2FrictionJointDef.prototype, 'localAnchorA', { get: b2FrictionJointDef.prototype.get_localAnchorA, set: b2FrictionJointDef.prototype.set_localAnchorA });
  b2FrictionJointDef.prototype['get_localAnchorB'] = b2FrictionJointDef.prototype.get_localAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2FrictionJointDef_get_localAnchorB_0(self), b2Vec2);
};
    b2FrictionJointDef.prototype['set_localAnchorB'] = b2FrictionJointDef.prototype.set_localAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FrictionJointDef_set_localAnchorB_1(self, arg0);
};
    Object.defineProperty(b2FrictionJointDef.prototype, 'localAnchorB', { get: b2FrictionJointDef.prototype.get_localAnchorB, set: b2FrictionJointDef.prototype.set_localAnchorB });
  b2FrictionJointDef.prototype['get_maxForce'] = b2FrictionJointDef.prototype.get_maxForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2FrictionJointDef_get_maxForce_0(self);
};
    b2FrictionJointDef.prototype['set_maxForce'] = b2FrictionJointDef.prototype.set_maxForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FrictionJointDef_set_maxForce_1(self, arg0);
};
    Object.defineProperty(b2FrictionJointDef.prototype, 'maxForce', { get: b2FrictionJointDef.prototype.get_maxForce, set: b2FrictionJointDef.prototype.set_maxForce });
  b2FrictionJointDef.prototype['get_maxTorque'] = b2FrictionJointDef.prototype.get_maxTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2FrictionJointDef_get_maxTorque_0(self);
};
    b2FrictionJointDef.prototype['set_maxTorque'] = b2FrictionJointDef.prototype.set_maxTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FrictionJointDef_set_maxTorque_1(self, arg0);
};
    Object.defineProperty(b2FrictionJointDef.prototype, 'maxTorque', { get: b2FrictionJointDef.prototype.get_maxTorque, set: b2FrictionJointDef.prototype.set_maxTorque });
  b2FrictionJointDef.prototype['get_type'] = b2FrictionJointDef.prototype.get_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2FrictionJointDef_get_type_0(self);
};
    b2FrictionJointDef.prototype['set_type'] = b2FrictionJointDef.prototype.set_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FrictionJointDef_set_type_1(self, arg0);
};
    Object.defineProperty(b2FrictionJointDef.prototype, 'type', { get: b2FrictionJointDef.prototype.get_type, set: b2FrictionJointDef.prototype.set_type });
  b2FrictionJointDef.prototype['get_userData'] = b2FrictionJointDef.prototype.get_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2FrictionJointDef_get_userData_0(self), b2JointUserData);
};
    b2FrictionJointDef.prototype['set_userData'] = b2FrictionJointDef.prototype.set_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FrictionJointDef_set_userData_1(self, arg0);
};
    Object.defineProperty(b2FrictionJointDef.prototype, 'userData', { get: b2FrictionJointDef.prototype.get_userData, set: b2FrictionJointDef.prototype.set_userData });
  b2FrictionJointDef.prototype['get_bodyA'] = b2FrictionJointDef.prototype.get_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2FrictionJointDef_get_bodyA_0(self), b2Body);
};
    b2FrictionJointDef.prototype['set_bodyA'] = b2FrictionJointDef.prototype.set_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FrictionJointDef_set_bodyA_1(self, arg0);
};
    Object.defineProperty(b2FrictionJointDef.prototype, 'bodyA', { get: b2FrictionJointDef.prototype.get_bodyA, set: b2FrictionJointDef.prototype.set_bodyA });
  b2FrictionJointDef.prototype['get_bodyB'] = b2FrictionJointDef.prototype.get_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2FrictionJointDef_get_bodyB_0(self), b2Body);
};
    b2FrictionJointDef.prototype['set_bodyB'] = b2FrictionJointDef.prototype.set_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FrictionJointDef_set_bodyB_1(self, arg0);
};
    Object.defineProperty(b2FrictionJointDef.prototype, 'bodyB', { get: b2FrictionJointDef.prototype.get_bodyB, set: b2FrictionJointDef.prototype.set_bodyB });
  b2FrictionJointDef.prototype['get_collideConnected'] = b2FrictionJointDef.prototype.get_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2FrictionJointDef_get_collideConnected_0(self));
};
    b2FrictionJointDef.prototype['set_collideConnected'] = b2FrictionJointDef.prototype.set_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2FrictionJointDef_set_collideConnected_1(self, arg0);
};
    Object.defineProperty(b2FrictionJointDef.prototype, 'collideConnected', { get: b2FrictionJointDef.prototype.get_collideConnected, set: b2FrictionJointDef.prototype.set_collideConnected });
  b2FrictionJointDef.prototype['__destroy__'] = b2FrictionJointDef.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2FrictionJointDef___destroy___0(self);
};
// b2GearJoint
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2GearJoint() { throw "cannot construct a b2GearJoint, no constructor in IDL" }
b2GearJoint.prototype = Object.create(b2Joint.prototype);
b2GearJoint.prototype.constructor = b2GearJoint;
b2GearJoint.prototype.__class__ = b2GearJoint;
b2GearJoint.__cache__ = {};
Module['b2GearJoint'] = b2GearJoint;

b2GearJoint.prototype['GetJoint1'] = b2GearJoint.prototype.GetJoint1 = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2GearJoint_GetJoint1_0(self), b2Joint);
};;

b2GearJoint.prototype['GetJoint2'] = b2GearJoint.prototype.GetJoint2 = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2GearJoint_GetJoint2_0(self), b2Joint);
};;

b2GearJoint.prototype['SetRatio'] = b2GearJoint.prototype.SetRatio = /** @suppress {undefinedVars, duplicate} @this{Object} */function(ratio) {
  var self = this.ptr;
  if (ratio && typeof ratio === 'object') ratio = ratio.ptr;
  _emscripten_bind_b2GearJoint_SetRatio_1(self, ratio);
};;

b2GearJoint.prototype['GetRatio'] = b2GearJoint.prototype.GetRatio = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2GearJoint_GetRatio_0(self);
};;

b2GearJoint.prototype['GetType'] = b2GearJoint.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2GearJoint_GetType_0(self);
};;

b2GearJoint.prototype['GetBodyA'] = b2GearJoint.prototype.GetBodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2GearJoint_GetBodyA_0(self), b2Body);
};;

b2GearJoint.prototype['GetBodyB'] = b2GearJoint.prototype.GetBodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2GearJoint_GetBodyB_0(self), b2Body);
};;

b2GearJoint.prototype['GetAnchorA'] = b2GearJoint.prototype.GetAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2GearJoint_GetAnchorA_0(self), b2Vec2);
};;

b2GearJoint.prototype['GetAnchorB'] = b2GearJoint.prototype.GetAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2GearJoint_GetAnchorB_0(self), b2Vec2);
};;

b2GearJoint.prototype['GetReactionForce'] = b2GearJoint.prototype.GetReactionForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return wrapPointer(_emscripten_bind_b2GearJoint_GetReactionForce_1(self, inv_dt), b2Vec2);
};;

b2GearJoint.prototype['GetReactionTorque'] = b2GearJoint.prototype.GetReactionTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return _emscripten_bind_b2GearJoint_GetReactionTorque_1(self, inv_dt);
};;

b2GearJoint.prototype['GetNext'] = b2GearJoint.prototype.GetNext = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2GearJoint_GetNext_0(self), b2Joint);
};;

b2GearJoint.prototype['GetUserData'] = b2GearJoint.prototype.GetUserData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2GearJoint_GetUserData_0(self), b2JointUserData);
};;

b2GearJoint.prototype['GetCollideConnected'] = b2GearJoint.prototype.GetCollideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2GearJoint_GetCollideConnected_0(self));
};;

  b2GearJoint.prototype['__destroy__'] = b2GearJoint.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2GearJoint___destroy___0(self);
};
// b2GearJointDef
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2GearJointDef() {
  this.ptr = _emscripten_bind_b2GearJointDef_b2GearJointDef_0();
  getCache(b2GearJointDef)[this.ptr] = this;
};;
b2GearJointDef.prototype = Object.create(b2JointDef.prototype);
b2GearJointDef.prototype.constructor = b2GearJointDef;
b2GearJointDef.prototype.__class__ = b2GearJointDef;
b2GearJointDef.__cache__ = {};
Module['b2GearJointDef'] = b2GearJointDef;

  b2GearJointDef.prototype['get_joint1'] = b2GearJointDef.prototype.get_joint1 = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2GearJointDef_get_joint1_0(self), b2Joint);
};
    b2GearJointDef.prototype['set_joint1'] = b2GearJointDef.prototype.set_joint1 = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2GearJointDef_set_joint1_1(self, arg0);
};
    Object.defineProperty(b2GearJointDef.prototype, 'joint1', { get: b2GearJointDef.prototype.get_joint1, set: b2GearJointDef.prototype.set_joint1 });
  b2GearJointDef.prototype['get_joint2'] = b2GearJointDef.prototype.get_joint2 = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2GearJointDef_get_joint2_0(self), b2Joint);
};
    b2GearJointDef.prototype['set_joint2'] = b2GearJointDef.prototype.set_joint2 = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2GearJointDef_set_joint2_1(self, arg0);
};
    Object.defineProperty(b2GearJointDef.prototype, 'joint2', { get: b2GearJointDef.prototype.get_joint2, set: b2GearJointDef.prototype.set_joint2 });
  b2GearJointDef.prototype['get_ratio'] = b2GearJointDef.prototype.get_ratio = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2GearJointDef_get_ratio_0(self);
};
    b2GearJointDef.prototype['set_ratio'] = b2GearJointDef.prototype.set_ratio = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2GearJointDef_set_ratio_1(self, arg0);
};
    Object.defineProperty(b2GearJointDef.prototype, 'ratio', { get: b2GearJointDef.prototype.get_ratio, set: b2GearJointDef.prototype.set_ratio });
  b2GearJointDef.prototype['get_type'] = b2GearJointDef.prototype.get_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2GearJointDef_get_type_0(self);
};
    b2GearJointDef.prototype['set_type'] = b2GearJointDef.prototype.set_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2GearJointDef_set_type_1(self, arg0);
};
    Object.defineProperty(b2GearJointDef.prototype, 'type', { get: b2GearJointDef.prototype.get_type, set: b2GearJointDef.prototype.set_type });
  b2GearJointDef.prototype['get_userData'] = b2GearJointDef.prototype.get_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2GearJointDef_get_userData_0(self), b2JointUserData);
};
    b2GearJointDef.prototype['set_userData'] = b2GearJointDef.prototype.set_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2GearJointDef_set_userData_1(self, arg0);
};
    Object.defineProperty(b2GearJointDef.prototype, 'userData', { get: b2GearJointDef.prototype.get_userData, set: b2GearJointDef.prototype.set_userData });
  b2GearJointDef.prototype['get_bodyA'] = b2GearJointDef.prototype.get_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2GearJointDef_get_bodyA_0(self), b2Body);
};
    b2GearJointDef.prototype['set_bodyA'] = b2GearJointDef.prototype.set_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2GearJointDef_set_bodyA_1(self, arg0);
};
    Object.defineProperty(b2GearJointDef.prototype, 'bodyA', { get: b2GearJointDef.prototype.get_bodyA, set: b2GearJointDef.prototype.set_bodyA });
  b2GearJointDef.prototype['get_bodyB'] = b2GearJointDef.prototype.get_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2GearJointDef_get_bodyB_0(self), b2Body);
};
    b2GearJointDef.prototype['set_bodyB'] = b2GearJointDef.prototype.set_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2GearJointDef_set_bodyB_1(self, arg0);
};
    Object.defineProperty(b2GearJointDef.prototype, 'bodyB', { get: b2GearJointDef.prototype.get_bodyB, set: b2GearJointDef.prototype.set_bodyB });
  b2GearJointDef.prototype['get_collideConnected'] = b2GearJointDef.prototype.get_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2GearJointDef_get_collideConnected_0(self));
};
    b2GearJointDef.prototype['set_collideConnected'] = b2GearJointDef.prototype.set_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2GearJointDef_set_collideConnected_1(self, arg0);
};
    Object.defineProperty(b2GearJointDef.prototype, 'collideConnected', { get: b2GearJointDef.prototype.get_collideConnected, set: b2GearJointDef.prototype.set_collideConnected });
  b2GearJointDef.prototype['__destroy__'] = b2GearJointDef.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2GearJointDef___destroy___0(self);
};
// b2JointEdge
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2JointEdge() {
  this.ptr = _emscripten_bind_b2JointEdge_b2JointEdge_0();
  getCache(b2JointEdge)[this.ptr] = this;
};;
b2JointEdge.prototype = Object.create(WrapperObject.prototype);
b2JointEdge.prototype.constructor = b2JointEdge;
b2JointEdge.prototype.__class__ = b2JointEdge;
b2JointEdge.__cache__ = {};
Module['b2JointEdge'] = b2JointEdge;

  b2JointEdge.prototype['get_other'] = b2JointEdge.prototype.get_other = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2JointEdge_get_other_0(self), b2Body);
};
    b2JointEdge.prototype['set_other'] = b2JointEdge.prototype.set_other = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2JointEdge_set_other_1(self, arg0);
};
    Object.defineProperty(b2JointEdge.prototype, 'other', { get: b2JointEdge.prototype.get_other, set: b2JointEdge.prototype.set_other });
  b2JointEdge.prototype['get_joint'] = b2JointEdge.prototype.get_joint = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2JointEdge_get_joint_0(self), b2Joint);
};
    b2JointEdge.prototype['set_joint'] = b2JointEdge.prototype.set_joint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2JointEdge_set_joint_1(self, arg0);
};
    Object.defineProperty(b2JointEdge.prototype, 'joint', { get: b2JointEdge.prototype.get_joint, set: b2JointEdge.prototype.set_joint });
  b2JointEdge.prototype['get_prev'] = b2JointEdge.prototype.get_prev = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2JointEdge_get_prev_0(self), b2JointEdge);
};
    b2JointEdge.prototype['set_prev'] = b2JointEdge.prototype.set_prev = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2JointEdge_set_prev_1(self, arg0);
};
    Object.defineProperty(b2JointEdge.prototype, 'prev', { get: b2JointEdge.prototype.get_prev, set: b2JointEdge.prototype.set_prev });
  b2JointEdge.prototype['get_next'] = b2JointEdge.prototype.get_next = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2JointEdge_get_next_0(self), b2JointEdge);
};
    b2JointEdge.prototype['set_next'] = b2JointEdge.prototype.set_next = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2JointEdge_set_next_1(self, arg0);
};
    Object.defineProperty(b2JointEdge.prototype, 'next', { get: b2JointEdge.prototype.get_next, set: b2JointEdge.prototype.set_next });
  b2JointEdge.prototype['__destroy__'] = b2JointEdge.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2JointEdge___destroy___0(self);
};
// b2Manifold
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Manifold() {
  this.ptr = _emscripten_bind_b2Manifold_b2Manifold_0();
  getCache(b2Manifold)[this.ptr] = this;
};;
b2Manifold.prototype = Object.create(WrapperObject.prototype);
b2Manifold.prototype.constructor = b2Manifold;
b2Manifold.prototype.__class__ = b2Manifold;
b2Manifold.__cache__ = {};
Module['b2Manifold'] = b2Manifold;

  b2Manifold.prototype['get_points'] = b2Manifold.prototype.get_points = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  return wrapPointer(_emscripten_bind_b2Manifold_get_points_1(self, arg0), b2ManifoldPoint);
};
    b2Manifold.prototype['set_points'] = b2Manifold.prototype.set_points = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0, arg1) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  if (arg1 && typeof arg1 === 'object') arg1 = arg1.ptr;
  _emscripten_bind_b2Manifold_set_points_2(self, arg0, arg1);
};
    Object.defineProperty(b2Manifold.prototype, 'points', { get: b2Manifold.prototype.get_points, set: b2Manifold.prototype.set_points });
  b2Manifold.prototype['get_localNormal'] = b2Manifold.prototype.get_localNormal = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Manifold_get_localNormal_0(self), b2Vec2);
};
    b2Manifold.prototype['set_localNormal'] = b2Manifold.prototype.set_localNormal = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Manifold_set_localNormal_1(self, arg0);
};
    Object.defineProperty(b2Manifold.prototype, 'localNormal', { get: b2Manifold.prototype.get_localNormal, set: b2Manifold.prototype.set_localNormal });
  b2Manifold.prototype['get_localPoint'] = b2Manifold.prototype.get_localPoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Manifold_get_localPoint_0(self), b2Vec2);
};
    b2Manifold.prototype['set_localPoint'] = b2Manifold.prototype.set_localPoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Manifold_set_localPoint_1(self, arg0);
};
    Object.defineProperty(b2Manifold.prototype, 'localPoint', { get: b2Manifold.prototype.get_localPoint, set: b2Manifold.prototype.set_localPoint });
  b2Manifold.prototype['get_type'] = b2Manifold.prototype.get_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Manifold_get_type_0(self);
};
    b2Manifold.prototype['set_type'] = b2Manifold.prototype.set_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Manifold_set_type_1(self, arg0);
};
    Object.defineProperty(b2Manifold.prototype, 'type', { get: b2Manifold.prototype.get_type, set: b2Manifold.prototype.set_type });
  b2Manifold.prototype['get_pointCount'] = b2Manifold.prototype.get_pointCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Manifold_get_pointCount_0(self);
};
    b2Manifold.prototype['set_pointCount'] = b2Manifold.prototype.set_pointCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Manifold_set_pointCount_1(self, arg0);
};
    Object.defineProperty(b2Manifold.prototype, 'pointCount', { get: b2Manifold.prototype.get_pointCount, set: b2Manifold.prototype.set_pointCount });
  b2Manifold.prototype['__destroy__'] = b2Manifold.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Manifold___destroy___0(self);
};
// b2WorldManifold
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2WorldManifold() {
  this.ptr = _emscripten_bind_b2WorldManifold_b2WorldManifold_0();
  getCache(b2WorldManifold)[this.ptr] = this;
};;
b2WorldManifold.prototype = Object.create(WrapperObject.prototype);
b2WorldManifold.prototype.constructor = b2WorldManifold;
b2WorldManifold.prototype.__class__ = b2WorldManifold;
b2WorldManifold.__cache__ = {};
Module['b2WorldManifold'] = b2WorldManifold;

b2WorldManifold.prototype['Initialize'] = b2WorldManifold.prototype.Initialize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(manifold, xfA, radiusA, xfB, radiusB) {
  var self = this.ptr;
  if (manifold && typeof manifold === 'object') manifold = manifold.ptr;
  if (xfA && typeof xfA === 'object') xfA = xfA.ptr;
  if (radiusA && typeof radiusA === 'object') radiusA = radiusA.ptr;
  if (xfB && typeof xfB === 'object') xfB = xfB.ptr;
  if (radiusB && typeof radiusB === 'object') radiusB = radiusB.ptr;
  _emscripten_bind_b2WorldManifold_Initialize_5(self, manifold, xfA, radiusA, xfB, radiusB);
};;

  b2WorldManifold.prototype['get_normal'] = b2WorldManifold.prototype.get_normal = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WorldManifold_get_normal_0(self), b2Vec2);
};
    b2WorldManifold.prototype['set_normal'] = b2WorldManifold.prototype.set_normal = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WorldManifold_set_normal_1(self, arg0);
};
    Object.defineProperty(b2WorldManifold.prototype, 'normal', { get: b2WorldManifold.prototype.get_normal, set: b2WorldManifold.prototype.set_normal });
  b2WorldManifold.prototype['get_points'] = b2WorldManifold.prototype.get_points = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  return wrapPointer(_emscripten_bind_b2WorldManifold_get_points_1(self, arg0), b2Vec2);
};
    b2WorldManifold.prototype['set_points'] = b2WorldManifold.prototype.set_points = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0, arg1) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  if (arg1 && typeof arg1 === 'object') arg1 = arg1.ptr;
  _emscripten_bind_b2WorldManifold_set_points_2(self, arg0, arg1);
};
    Object.defineProperty(b2WorldManifold.prototype, 'points', { get: b2WorldManifold.prototype.get_points, set: b2WorldManifold.prototype.set_points });
  b2WorldManifold.prototype['get_separations'] = b2WorldManifold.prototype.get_separations = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  return _emscripten_bind_b2WorldManifold_get_separations_1(self, arg0);
};
    b2WorldManifold.prototype['set_separations'] = b2WorldManifold.prototype.set_separations = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0, arg1) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  if (arg1 && typeof arg1 === 'object') arg1 = arg1.ptr;
  _emscripten_bind_b2WorldManifold_set_separations_2(self, arg0, arg1);
};
    Object.defineProperty(b2WorldManifold.prototype, 'separations', { get: b2WorldManifold.prototype.get_separations, set: b2WorldManifold.prototype.set_separations });
  b2WorldManifold.prototype['__destroy__'] = b2WorldManifold.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2WorldManifold___destroy___0(self);
};
// b2ManifoldPoint
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2ManifoldPoint() {
  this.ptr = _emscripten_bind_b2ManifoldPoint_b2ManifoldPoint_0();
  getCache(b2ManifoldPoint)[this.ptr] = this;
};;
b2ManifoldPoint.prototype = Object.create(WrapperObject.prototype);
b2ManifoldPoint.prototype.constructor = b2ManifoldPoint;
b2ManifoldPoint.prototype.__class__ = b2ManifoldPoint;
b2ManifoldPoint.__cache__ = {};
Module['b2ManifoldPoint'] = b2ManifoldPoint;

  b2ManifoldPoint.prototype['get_localPoint'] = b2ManifoldPoint.prototype.get_localPoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2ManifoldPoint_get_localPoint_0(self), b2Vec2);
};
    b2ManifoldPoint.prototype['set_localPoint'] = b2ManifoldPoint.prototype.set_localPoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ManifoldPoint_set_localPoint_1(self, arg0);
};
    Object.defineProperty(b2ManifoldPoint.prototype, 'localPoint', { get: b2ManifoldPoint.prototype.get_localPoint, set: b2ManifoldPoint.prototype.set_localPoint });
  b2ManifoldPoint.prototype['get_normalImpulse'] = b2ManifoldPoint.prototype.get_normalImpulse = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2ManifoldPoint_get_normalImpulse_0(self);
};
    b2ManifoldPoint.prototype['set_normalImpulse'] = b2ManifoldPoint.prototype.set_normalImpulse = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ManifoldPoint_set_normalImpulse_1(self, arg0);
};
    Object.defineProperty(b2ManifoldPoint.prototype, 'normalImpulse', { get: b2ManifoldPoint.prototype.get_normalImpulse, set: b2ManifoldPoint.prototype.set_normalImpulse });
  b2ManifoldPoint.prototype['get_tangentImpulse'] = b2ManifoldPoint.prototype.get_tangentImpulse = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2ManifoldPoint_get_tangentImpulse_0(self);
};
    b2ManifoldPoint.prototype['set_tangentImpulse'] = b2ManifoldPoint.prototype.set_tangentImpulse = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ManifoldPoint_set_tangentImpulse_1(self, arg0);
};
    Object.defineProperty(b2ManifoldPoint.prototype, 'tangentImpulse', { get: b2ManifoldPoint.prototype.get_tangentImpulse, set: b2ManifoldPoint.prototype.set_tangentImpulse });
  b2ManifoldPoint.prototype['get_id'] = b2ManifoldPoint.prototype.get_id = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2ManifoldPoint_get_id_0(self), b2ContactID);
};
    b2ManifoldPoint.prototype['set_id'] = b2ManifoldPoint.prototype.set_id = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ManifoldPoint_set_id_1(self, arg0);
};
    Object.defineProperty(b2ManifoldPoint.prototype, 'id', { get: b2ManifoldPoint.prototype.get_id, set: b2ManifoldPoint.prototype.set_id });
  b2ManifoldPoint.prototype['__destroy__'] = b2ManifoldPoint.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2ManifoldPoint___destroy___0(self);
};
// b2Mat22
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Mat22(a11, a12, a21, a22) {
  if (a11 && typeof a11 === 'object') a11 = a11.ptr;
  if (a12 && typeof a12 === 'object') a12 = a12.ptr;
  if (a21 && typeof a21 === 'object') a21 = a21.ptr;
  if (a22 && typeof a22 === 'object') a22 = a22.ptr;
  if (a11 === undefined) { this.ptr = _emscripten_bind_b2Mat22_b2Mat22_0(); getCache(b2Mat22)[this.ptr] = this;return }
  if (a12 === undefined) { this.ptr = _emscripten_bind_b2Mat22_b2Mat22_1(a11); getCache(b2Mat22)[this.ptr] = this;return }
  if (a21 === undefined) { this.ptr = _emscripten_bind_b2Mat22_b2Mat22_2(a11, a12); getCache(b2Mat22)[this.ptr] = this;return }
  if (a22 === undefined) { this.ptr = _emscripten_bind_b2Mat22_b2Mat22_3(a11, a12, a21); getCache(b2Mat22)[this.ptr] = this;return }
  this.ptr = _emscripten_bind_b2Mat22_b2Mat22_4(a11, a12, a21, a22);
  getCache(b2Mat22)[this.ptr] = this;
};;
b2Mat22.prototype = Object.create(WrapperObject.prototype);
b2Mat22.prototype.constructor = b2Mat22;
b2Mat22.prototype.__class__ = b2Mat22;
b2Mat22.__cache__ = {};
Module['b2Mat22'] = b2Mat22;

b2Mat22.prototype['Set'] = b2Mat22.prototype.Set = /** @suppress {undefinedVars, duplicate} @this{Object} */function(c1, c2) {
  var self = this.ptr;
  if (c1 && typeof c1 === 'object') c1 = c1.ptr;
  if (c2 && typeof c2 === 'object') c2 = c2.ptr;
  _emscripten_bind_b2Mat22_Set_2(self, c1, c2);
};;

b2Mat22.prototype['SetIdentity'] = b2Mat22.prototype.SetIdentity = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Mat22_SetIdentity_0(self);
};;

b2Mat22.prototype['SetZero'] = b2Mat22.prototype.SetZero = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Mat22_SetZero_0(self);
};;

b2Mat22.prototype['GetInverse'] = b2Mat22.prototype.GetInverse = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Mat22_GetInverse_0(self), b2Mat22);
};;

b2Mat22.prototype['Solve'] = b2Mat22.prototype.Solve = /** @suppress {undefinedVars, duplicate} @this{Object} */function(b) {
  var self = this.ptr;
  if (b && typeof b === 'object') b = b.ptr;
  return wrapPointer(_emscripten_bind_b2Mat22_Solve_1(self, b), b2Vec2);
};;

  b2Mat22.prototype['get_ex'] = b2Mat22.prototype.get_ex = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Mat22_get_ex_0(self), b2Vec2);
};
    b2Mat22.prototype['set_ex'] = b2Mat22.prototype.set_ex = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Mat22_set_ex_1(self, arg0);
};
    Object.defineProperty(b2Mat22.prototype, 'ex', { get: b2Mat22.prototype.get_ex, set: b2Mat22.prototype.set_ex });
  b2Mat22.prototype['get_ey'] = b2Mat22.prototype.get_ey = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Mat22_get_ey_0(self), b2Vec2);
};
    b2Mat22.prototype['set_ey'] = b2Mat22.prototype.set_ey = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Mat22_set_ey_1(self, arg0);
};
    Object.defineProperty(b2Mat22.prototype, 'ey', { get: b2Mat22.prototype.get_ey, set: b2Mat22.prototype.set_ey });
  b2Mat22.prototype['__destroy__'] = b2Mat22.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Mat22___destroy___0(self);
};
// b2Mat33
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Mat33(c1, c2, c3) {
  if (c1 && typeof c1 === 'object') c1 = c1.ptr;
  if (c2 && typeof c2 === 'object') c2 = c2.ptr;
  if (c3 && typeof c3 === 'object') c3 = c3.ptr;
  if (c1 === undefined) { this.ptr = _emscripten_bind_b2Mat33_b2Mat33_0(); getCache(b2Mat33)[this.ptr] = this;return }
  if (c2 === undefined) { this.ptr = _emscripten_bind_b2Mat33_b2Mat33_1(c1); getCache(b2Mat33)[this.ptr] = this;return }
  if (c3 === undefined) { this.ptr = _emscripten_bind_b2Mat33_b2Mat33_2(c1, c2); getCache(b2Mat33)[this.ptr] = this;return }
  this.ptr = _emscripten_bind_b2Mat33_b2Mat33_3(c1, c2, c3);
  getCache(b2Mat33)[this.ptr] = this;
};;
b2Mat33.prototype = Object.create(WrapperObject.prototype);
b2Mat33.prototype.constructor = b2Mat33;
b2Mat33.prototype.__class__ = b2Mat33;
b2Mat33.__cache__ = {};
Module['b2Mat33'] = b2Mat33;

b2Mat33.prototype['SetZero'] = b2Mat33.prototype.SetZero = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Mat33_SetZero_0(self);
};;

b2Mat33.prototype['Solve33'] = b2Mat33.prototype.Solve33 = /** @suppress {undefinedVars, duplicate} @this{Object} */function(b) {
  var self = this.ptr;
  if (b && typeof b === 'object') b = b.ptr;
  return wrapPointer(_emscripten_bind_b2Mat33_Solve33_1(self, b), b2Vec3);
};;

b2Mat33.prototype['Solve22'] = b2Mat33.prototype.Solve22 = /** @suppress {undefinedVars, duplicate} @this{Object} */function(b) {
  var self = this.ptr;
  if (b && typeof b === 'object') b = b.ptr;
  return wrapPointer(_emscripten_bind_b2Mat33_Solve22_1(self, b), b2Vec2);
};;

b2Mat33.prototype['GetInverse22'] = b2Mat33.prototype.GetInverse22 = /** @suppress {undefinedVars, duplicate} @this{Object} */function(M) {
  var self = this.ptr;
  if (M && typeof M === 'object') M = M.ptr;
  _emscripten_bind_b2Mat33_GetInverse22_1(self, M);
};;

b2Mat33.prototype['GetSymInverse33'] = b2Mat33.prototype.GetSymInverse33 = /** @suppress {undefinedVars, duplicate} @this{Object} */function(M) {
  var self = this.ptr;
  if (M && typeof M === 'object') M = M.ptr;
  _emscripten_bind_b2Mat33_GetSymInverse33_1(self, M);
};;

  b2Mat33.prototype['get_ex'] = b2Mat33.prototype.get_ex = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Mat33_get_ex_0(self), b2Vec3);
};
    b2Mat33.prototype['set_ex'] = b2Mat33.prototype.set_ex = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Mat33_set_ex_1(self, arg0);
};
    Object.defineProperty(b2Mat33.prototype, 'ex', { get: b2Mat33.prototype.get_ex, set: b2Mat33.prototype.set_ex });
  b2Mat33.prototype['get_ey'] = b2Mat33.prototype.get_ey = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Mat33_get_ey_0(self), b2Vec3);
};
    b2Mat33.prototype['set_ey'] = b2Mat33.prototype.set_ey = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Mat33_set_ey_1(self, arg0);
};
    Object.defineProperty(b2Mat33.prototype, 'ey', { get: b2Mat33.prototype.get_ey, set: b2Mat33.prototype.set_ey });
  b2Mat33.prototype['get_ez'] = b2Mat33.prototype.get_ez = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Mat33_get_ez_0(self), b2Vec3);
};
    b2Mat33.prototype['set_ez'] = b2Mat33.prototype.set_ez = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Mat33_set_ez_1(self, arg0);
};
    Object.defineProperty(b2Mat33.prototype, 'ez', { get: b2Mat33.prototype.get_ez, set: b2Mat33.prototype.set_ez });
  b2Mat33.prototype['__destroy__'] = b2Mat33.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Mat33___destroy___0(self);
};
// b2MouseJoint
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2MouseJoint() { throw "cannot construct a b2MouseJoint, no constructor in IDL" }
b2MouseJoint.prototype = Object.create(b2Joint.prototype);
b2MouseJoint.prototype.constructor = b2MouseJoint;
b2MouseJoint.prototype.__class__ = b2MouseJoint;
b2MouseJoint.__cache__ = {};
Module['b2MouseJoint'] = b2MouseJoint;

b2MouseJoint.prototype['SetTarget'] = b2MouseJoint.prototype.SetTarget = /** @suppress {undefinedVars, duplicate} @this{Object} */function(target) {
  var self = this.ptr;
  if (target && typeof target === 'object') target = target.ptr;
  _emscripten_bind_b2MouseJoint_SetTarget_1(self, target);
};;

b2MouseJoint.prototype['GetTarget'] = b2MouseJoint.prototype.GetTarget = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MouseJoint_GetTarget_0(self), b2Vec2);
};;

b2MouseJoint.prototype['SetMaxForce'] = b2MouseJoint.prototype.SetMaxForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(force) {
  var self = this.ptr;
  if (force && typeof force === 'object') force = force.ptr;
  _emscripten_bind_b2MouseJoint_SetMaxForce_1(self, force);
};;

b2MouseJoint.prototype['GetMaxForce'] = b2MouseJoint.prototype.GetMaxForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MouseJoint_GetMaxForce_0(self);
};;

b2MouseJoint.prototype['SetStiffness'] = b2MouseJoint.prototype.SetStiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function(stiffness) {
  var self = this.ptr;
  if (stiffness && typeof stiffness === 'object') stiffness = stiffness.ptr;
  _emscripten_bind_b2MouseJoint_SetStiffness_1(self, stiffness);
};;

b2MouseJoint.prototype['GetStiffness'] = b2MouseJoint.prototype.GetStiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MouseJoint_GetStiffness_0(self);
};;

b2MouseJoint.prototype['SetDamping'] = b2MouseJoint.prototype.SetDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(damping) {
  var self = this.ptr;
  if (damping && typeof damping === 'object') damping = damping.ptr;
  _emscripten_bind_b2MouseJoint_SetDamping_1(self, damping);
};;

b2MouseJoint.prototype['GetDamping'] = b2MouseJoint.prototype.GetDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MouseJoint_GetDamping_0(self);
};;

b2MouseJoint.prototype['GetType'] = b2MouseJoint.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MouseJoint_GetType_0(self);
};;

b2MouseJoint.prototype['GetBodyA'] = b2MouseJoint.prototype.GetBodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MouseJoint_GetBodyA_0(self), b2Body);
};;

b2MouseJoint.prototype['GetBodyB'] = b2MouseJoint.prototype.GetBodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MouseJoint_GetBodyB_0(self), b2Body);
};;

b2MouseJoint.prototype['GetAnchorA'] = b2MouseJoint.prototype.GetAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MouseJoint_GetAnchorA_0(self), b2Vec2);
};;

b2MouseJoint.prototype['GetAnchorB'] = b2MouseJoint.prototype.GetAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MouseJoint_GetAnchorB_0(self), b2Vec2);
};;

b2MouseJoint.prototype['GetReactionForce'] = b2MouseJoint.prototype.GetReactionForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return wrapPointer(_emscripten_bind_b2MouseJoint_GetReactionForce_1(self, inv_dt), b2Vec2);
};;

b2MouseJoint.prototype['GetReactionTorque'] = b2MouseJoint.prototype.GetReactionTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return _emscripten_bind_b2MouseJoint_GetReactionTorque_1(self, inv_dt);
};;

b2MouseJoint.prototype['GetNext'] = b2MouseJoint.prototype.GetNext = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MouseJoint_GetNext_0(self), b2Joint);
};;

b2MouseJoint.prototype['GetUserData'] = b2MouseJoint.prototype.GetUserData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MouseJoint_GetUserData_0(self), b2JointUserData);
};;

b2MouseJoint.prototype['GetCollideConnected'] = b2MouseJoint.prototype.GetCollideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2MouseJoint_GetCollideConnected_0(self));
};;

  b2MouseJoint.prototype['__destroy__'] = b2MouseJoint.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2MouseJoint___destroy___0(self);
};
// b2MouseJointDef
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2MouseJointDef() {
  this.ptr = _emscripten_bind_b2MouseJointDef_b2MouseJointDef_0();
  getCache(b2MouseJointDef)[this.ptr] = this;
};;
b2MouseJointDef.prototype = Object.create(b2JointDef.prototype);
b2MouseJointDef.prototype.constructor = b2MouseJointDef;
b2MouseJointDef.prototype.__class__ = b2MouseJointDef;
b2MouseJointDef.__cache__ = {};
Module['b2MouseJointDef'] = b2MouseJointDef;

  b2MouseJointDef.prototype['get_target'] = b2MouseJointDef.prototype.get_target = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MouseJointDef_get_target_0(self), b2Vec2);
};
    b2MouseJointDef.prototype['set_target'] = b2MouseJointDef.prototype.set_target = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MouseJointDef_set_target_1(self, arg0);
};
    Object.defineProperty(b2MouseJointDef.prototype, 'target', { get: b2MouseJointDef.prototype.get_target, set: b2MouseJointDef.prototype.set_target });
  b2MouseJointDef.prototype['get_maxForce'] = b2MouseJointDef.prototype.get_maxForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MouseJointDef_get_maxForce_0(self);
};
    b2MouseJointDef.prototype['set_maxForce'] = b2MouseJointDef.prototype.set_maxForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MouseJointDef_set_maxForce_1(self, arg0);
};
    Object.defineProperty(b2MouseJointDef.prototype, 'maxForce', { get: b2MouseJointDef.prototype.get_maxForce, set: b2MouseJointDef.prototype.set_maxForce });
  b2MouseJointDef.prototype['get_stiffness'] = b2MouseJointDef.prototype.get_stiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MouseJointDef_get_stiffness_0(self);
};
    b2MouseJointDef.prototype['set_stiffness'] = b2MouseJointDef.prototype.set_stiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MouseJointDef_set_stiffness_1(self, arg0);
};
    Object.defineProperty(b2MouseJointDef.prototype, 'stiffness', { get: b2MouseJointDef.prototype.get_stiffness, set: b2MouseJointDef.prototype.set_stiffness });
  b2MouseJointDef.prototype['get_damping'] = b2MouseJointDef.prototype.get_damping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MouseJointDef_get_damping_0(self);
};
    b2MouseJointDef.prototype['set_damping'] = b2MouseJointDef.prototype.set_damping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MouseJointDef_set_damping_1(self, arg0);
};
    Object.defineProperty(b2MouseJointDef.prototype, 'damping', { get: b2MouseJointDef.prototype.get_damping, set: b2MouseJointDef.prototype.set_damping });
  b2MouseJointDef.prototype['get_type'] = b2MouseJointDef.prototype.get_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MouseJointDef_get_type_0(self);
};
    b2MouseJointDef.prototype['set_type'] = b2MouseJointDef.prototype.set_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MouseJointDef_set_type_1(self, arg0);
};
    Object.defineProperty(b2MouseJointDef.prototype, 'type', { get: b2MouseJointDef.prototype.get_type, set: b2MouseJointDef.prototype.set_type });
  b2MouseJointDef.prototype['get_userData'] = b2MouseJointDef.prototype.get_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MouseJointDef_get_userData_0(self), b2JointUserData);
};
    b2MouseJointDef.prototype['set_userData'] = b2MouseJointDef.prototype.set_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MouseJointDef_set_userData_1(self, arg0);
};
    Object.defineProperty(b2MouseJointDef.prototype, 'userData', { get: b2MouseJointDef.prototype.get_userData, set: b2MouseJointDef.prototype.set_userData });
  b2MouseJointDef.prototype['get_bodyA'] = b2MouseJointDef.prototype.get_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MouseJointDef_get_bodyA_0(self), b2Body);
};
    b2MouseJointDef.prototype['set_bodyA'] = b2MouseJointDef.prototype.set_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MouseJointDef_set_bodyA_1(self, arg0);
};
    Object.defineProperty(b2MouseJointDef.prototype, 'bodyA', { get: b2MouseJointDef.prototype.get_bodyA, set: b2MouseJointDef.prototype.set_bodyA });
  b2MouseJointDef.prototype['get_bodyB'] = b2MouseJointDef.prototype.get_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MouseJointDef_get_bodyB_0(self), b2Body);
};
    b2MouseJointDef.prototype['set_bodyB'] = b2MouseJointDef.prototype.set_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MouseJointDef_set_bodyB_1(self, arg0);
};
    Object.defineProperty(b2MouseJointDef.prototype, 'bodyB', { get: b2MouseJointDef.prototype.get_bodyB, set: b2MouseJointDef.prototype.set_bodyB });
  b2MouseJointDef.prototype['get_collideConnected'] = b2MouseJointDef.prototype.get_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2MouseJointDef_get_collideConnected_0(self));
};
    b2MouseJointDef.prototype['set_collideConnected'] = b2MouseJointDef.prototype.set_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MouseJointDef_set_collideConnected_1(self, arg0);
};
    Object.defineProperty(b2MouseJointDef.prototype, 'collideConnected', { get: b2MouseJointDef.prototype.get_collideConnected, set: b2MouseJointDef.prototype.set_collideConnected });
  b2MouseJointDef.prototype['__destroy__'] = b2MouseJointDef.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2MouseJointDef___destroy___0(self);
};
// b2PolygonShape
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2PolygonShape() {
  this.ptr = _emscripten_bind_b2PolygonShape_b2PolygonShape_0();
  getCache(b2PolygonShape)[this.ptr] = this;
};;
b2PolygonShape.prototype = Object.create(b2Shape.prototype);
b2PolygonShape.prototype.constructor = b2PolygonShape;
b2PolygonShape.prototype.__class__ = b2PolygonShape;
b2PolygonShape.__cache__ = {};
Module['b2PolygonShape'] = b2PolygonShape;

b2PolygonShape.prototype['Set'] = b2PolygonShape.prototype.Set = /** @suppress {undefinedVars, duplicate} @this{Object} */function(vertices, vertexCount) {
  var self = this.ptr;
  if (vertices && typeof vertices === 'object') vertices = vertices.ptr;
  if (vertexCount && typeof vertexCount === 'object') vertexCount = vertexCount.ptr;
  _emscripten_bind_b2PolygonShape_Set_2(self, vertices, vertexCount);
};;

b2PolygonShape.prototype['SetAsBox'] = b2PolygonShape.prototype.SetAsBox = /** @suppress {undefinedVars, duplicate} @this{Object} */function(hx, hy, center, angle) {
  var self = this.ptr;
  if (hx && typeof hx === 'object') hx = hx.ptr;
  if (hy && typeof hy === 'object') hy = hy.ptr;
  if (center && typeof center === 'object') center = center.ptr;
  if (angle && typeof angle === 'object') angle = angle.ptr;
  if (center === undefined) { _emscripten_bind_b2PolygonShape_SetAsBox_2(self, hx, hy);  return }
  if (angle === undefined) { _emscripten_bind_b2PolygonShape_SetAsBox_3(self, hx, hy, center);  return }
  _emscripten_bind_b2PolygonShape_SetAsBox_4(self, hx, hy, center, angle);
};;

b2PolygonShape.prototype['GetType'] = b2PolygonShape.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PolygonShape_GetType_0(self);
};;

b2PolygonShape.prototype['GetChildCount'] = b2PolygonShape.prototype.GetChildCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PolygonShape_GetChildCount_0(self);
};;

b2PolygonShape.prototype['TestPoint'] = b2PolygonShape.prototype.TestPoint = /** @suppress {undefinedVars, duplicate} @this{Object} */function(xf, p) {
  var self = this.ptr;
  if (xf && typeof xf === 'object') xf = xf.ptr;
  if (p && typeof p === 'object') p = p.ptr;
  return !!(_emscripten_bind_b2PolygonShape_TestPoint_2(self, xf, p));
};;

b2PolygonShape.prototype['RayCast'] = b2PolygonShape.prototype.RayCast = /** @suppress {undefinedVars, duplicate} @this{Object} */function(output, input, transform, childIndex) {
  var self = this.ptr;
  if (output && typeof output === 'object') output = output.ptr;
  if (input && typeof input === 'object') input = input.ptr;
  if (transform && typeof transform === 'object') transform = transform.ptr;
  if (childIndex && typeof childIndex === 'object') childIndex = childIndex.ptr;
  return !!(_emscripten_bind_b2PolygonShape_RayCast_4(self, output, input, transform, childIndex));
};;

b2PolygonShape.prototype['ComputeAABB'] = b2PolygonShape.prototype.ComputeAABB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(aabb, xf, childIndex) {
  var self = this.ptr;
  if (aabb && typeof aabb === 'object') aabb = aabb.ptr;
  if (xf && typeof xf === 'object') xf = xf.ptr;
  if (childIndex && typeof childIndex === 'object') childIndex = childIndex.ptr;
  _emscripten_bind_b2PolygonShape_ComputeAABB_3(self, aabb, xf, childIndex);
};;

b2PolygonShape.prototype['ComputeMass'] = b2PolygonShape.prototype.ComputeMass = /** @suppress {undefinedVars, duplicate} @this{Object} */function(massData, density) {
  var self = this.ptr;
  if (massData && typeof massData === 'object') massData = massData.ptr;
  if (density && typeof density === 'object') density = density.ptr;
  _emscripten_bind_b2PolygonShape_ComputeMass_2(self, massData, density);
};;

  b2PolygonShape.prototype['get_m_centroid'] = b2PolygonShape.prototype.get_m_centroid = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PolygonShape_get_m_centroid_0(self), b2Vec2);
};
    b2PolygonShape.prototype['set_m_centroid'] = b2PolygonShape.prototype.set_m_centroid = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PolygonShape_set_m_centroid_1(self, arg0);
};
    Object.defineProperty(b2PolygonShape.prototype, 'm_centroid', { get: b2PolygonShape.prototype.get_m_centroid, set: b2PolygonShape.prototype.set_m_centroid });
  b2PolygonShape.prototype['get_m_vertices'] = b2PolygonShape.prototype.get_m_vertices = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  return wrapPointer(_emscripten_bind_b2PolygonShape_get_m_vertices_1(self, arg0), b2Vec2);
};
    b2PolygonShape.prototype['set_m_vertices'] = b2PolygonShape.prototype.set_m_vertices = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0, arg1) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  if (arg1 && typeof arg1 === 'object') arg1 = arg1.ptr;
  _emscripten_bind_b2PolygonShape_set_m_vertices_2(self, arg0, arg1);
};
    Object.defineProperty(b2PolygonShape.prototype, 'm_vertices', { get: b2PolygonShape.prototype.get_m_vertices, set: b2PolygonShape.prototype.set_m_vertices });
  b2PolygonShape.prototype['get_m_normals'] = b2PolygonShape.prototype.get_m_normals = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  return wrapPointer(_emscripten_bind_b2PolygonShape_get_m_normals_1(self, arg0), b2Vec2);
};
    b2PolygonShape.prototype['set_m_normals'] = b2PolygonShape.prototype.set_m_normals = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0, arg1) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  if (arg1 && typeof arg1 === 'object') arg1 = arg1.ptr;
  _emscripten_bind_b2PolygonShape_set_m_normals_2(self, arg0, arg1);
};
    Object.defineProperty(b2PolygonShape.prototype, 'm_normals', { get: b2PolygonShape.prototype.get_m_normals, set: b2PolygonShape.prototype.set_m_normals });
  b2PolygonShape.prototype['get_m_count'] = b2PolygonShape.prototype.get_m_count = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PolygonShape_get_m_count_0(self);
};
    b2PolygonShape.prototype['set_m_count'] = b2PolygonShape.prototype.set_m_count = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PolygonShape_set_m_count_1(self, arg0);
};
    Object.defineProperty(b2PolygonShape.prototype, 'm_count', { get: b2PolygonShape.prototype.get_m_count, set: b2PolygonShape.prototype.set_m_count });
  b2PolygonShape.prototype['get_m_type'] = b2PolygonShape.prototype.get_m_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PolygonShape_get_m_type_0(self);
};
    b2PolygonShape.prototype['set_m_type'] = b2PolygonShape.prototype.set_m_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PolygonShape_set_m_type_1(self, arg0);
};
    Object.defineProperty(b2PolygonShape.prototype, 'm_type', { get: b2PolygonShape.prototype.get_m_type, set: b2PolygonShape.prototype.set_m_type });
  b2PolygonShape.prototype['get_m_radius'] = b2PolygonShape.prototype.get_m_radius = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PolygonShape_get_m_radius_0(self);
};
    b2PolygonShape.prototype['set_m_radius'] = b2PolygonShape.prototype.set_m_radius = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PolygonShape_set_m_radius_1(self, arg0);
};
    Object.defineProperty(b2PolygonShape.prototype, 'm_radius', { get: b2PolygonShape.prototype.get_m_radius, set: b2PolygonShape.prototype.set_m_radius });
  b2PolygonShape.prototype['__destroy__'] = b2PolygonShape.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2PolygonShape___destroy___0(self);
};
// b2PrismaticJoint
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2PrismaticJoint() { throw "cannot construct a b2PrismaticJoint, no constructor in IDL" }
b2PrismaticJoint.prototype = Object.create(b2Joint.prototype);
b2PrismaticJoint.prototype.constructor = b2PrismaticJoint;
b2PrismaticJoint.prototype.__class__ = b2PrismaticJoint;
b2PrismaticJoint.__cache__ = {};
Module['b2PrismaticJoint'] = b2PrismaticJoint;

b2PrismaticJoint.prototype['GetLocalAnchorA'] = b2PrismaticJoint.prototype.GetLocalAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PrismaticJoint_GetLocalAnchorA_0(self), b2Vec2);
};;

b2PrismaticJoint.prototype['GetLocalAnchorB'] = b2PrismaticJoint.prototype.GetLocalAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PrismaticJoint_GetLocalAnchorB_0(self), b2Vec2);
};;

b2PrismaticJoint.prototype['GetLocalAxisA'] = b2PrismaticJoint.prototype.GetLocalAxisA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PrismaticJoint_GetLocalAxisA_0(self), b2Vec2);
};;

b2PrismaticJoint.prototype['GetReferenceAngle'] = b2PrismaticJoint.prototype.GetReferenceAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PrismaticJoint_GetReferenceAngle_0(self);
};;

b2PrismaticJoint.prototype['GetJointTranslation'] = b2PrismaticJoint.prototype.GetJointTranslation = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PrismaticJoint_GetJointTranslation_0(self);
};;

b2PrismaticJoint.prototype['GetJointSpeed'] = b2PrismaticJoint.prototype.GetJointSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PrismaticJoint_GetJointSpeed_0(self);
};;

b2PrismaticJoint.prototype['IsLimitEnabled'] = b2PrismaticJoint.prototype.IsLimitEnabled = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2PrismaticJoint_IsLimitEnabled_0(self));
};;

b2PrismaticJoint.prototype['EnableLimit'] = b2PrismaticJoint.prototype.EnableLimit = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2PrismaticJoint_EnableLimit_1(self, flag);
};;

b2PrismaticJoint.prototype['GetLowerLimit'] = b2PrismaticJoint.prototype.GetLowerLimit = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PrismaticJoint_GetLowerLimit_0(self);
};;

b2PrismaticJoint.prototype['GetUpperLimit'] = b2PrismaticJoint.prototype.GetUpperLimit = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PrismaticJoint_GetUpperLimit_0(self);
};;

b2PrismaticJoint.prototype['SetLimits'] = b2PrismaticJoint.prototype.SetLimits = /** @suppress {undefinedVars, duplicate} @this{Object} */function(lower, upper) {
  var self = this.ptr;
  if (lower && typeof lower === 'object') lower = lower.ptr;
  if (upper && typeof upper === 'object') upper = upper.ptr;
  _emscripten_bind_b2PrismaticJoint_SetLimits_2(self, lower, upper);
};;

b2PrismaticJoint.prototype['IsMotorEnabled'] = b2PrismaticJoint.prototype.IsMotorEnabled = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2PrismaticJoint_IsMotorEnabled_0(self));
};;

b2PrismaticJoint.prototype['EnableMotor'] = b2PrismaticJoint.prototype.EnableMotor = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2PrismaticJoint_EnableMotor_1(self, flag);
};;

b2PrismaticJoint.prototype['SetMotorSpeed'] = b2PrismaticJoint.prototype.SetMotorSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function(speed) {
  var self = this.ptr;
  if (speed && typeof speed === 'object') speed = speed.ptr;
  _emscripten_bind_b2PrismaticJoint_SetMotorSpeed_1(self, speed);
};;

b2PrismaticJoint.prototype['GetMotorSpeed'] = b2PrismaticJoint.prototype.GetMotorSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PrismaticJoint_GetMotorSpeed_0(self);
};;

b2PrismaticJoint.prototype['SetMaxMotorForce'] = b2PrismaticJoint.prototype.SetMaxMotorForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(force) {
  var self = this.ptr;
  if (force && typeof force === 'object') force = force.ptr;
  _emscripten_bind_b2PrismaticJoint_SetMaxMotorForce_1(self, force);
};;

b2PrismaticJoint.prototype['GetMaxMotorForce'] = b2PrismaticJoint.prototype.GetMaxMotorForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PrismaticJoint_GetMaxMotorForce_0(self);
};;

b2PrismaticJoint.prototype['GetMotorForce'] = b2PrismaticJoint.prototype.GetMotorForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return _emscripten_bind_b2PrismaticJoint_GetMotorForce_1(self, inv_dt);
};;

b2PrismaticJoint.prototype['GetType'] = b2PrismaticJoint.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PrismaticJoint_GetType_0(self);
};;

b2PrismaticJoint.prototype['GetBodyA'] = b2PrismaticJoint.prototype.GetBodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PrismaticJoint_GetBodyA_0(self), b2Body);
};;

b2PrismaticJoint.prototype['GetBodyB'] = b2PrismaticJoint.prototype.GetBodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PrismaticJoint_GetBodyB_0(self), b2Body);
};;

b2PrismaticJoint.prototype['GetAnchorA'] = b2PrismaticJoint.prototype.GetAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PrismaticJoint_GetAnchorA_0(self), b2Vec2);
};;

b2PrismaticJoint.prototype['GetAnchorB'] = b2PrismaticJoint.prototype.GetAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PrismaticJoint_GetAnchorB_0(self), b2Vec2);
};;

b2PrismaticJoint.prototype['GetReactionForce'] = b2PrismaticJoint.prototype.GetReactionForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return wrapPointer(_emscripten_bind_b2PrismaticJoint_GetReactionForce_1(self, inv_dt), b2Vec2);
};;

b2PrismaticJoint.prototype['GetReactionTorque'] = b2PrismaticJoint.prototype.GetReactionTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return _emscripten_bind_b2PrismaticJoint_GetReactionTorque_1(self, inv_dt);
};;

b2PrismaticJoint.prototype['GetNext'] = b2PrismaticJoint.prototype.GetNext = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PrismaticJoint_GetNext_0(self), b2Joint);
};;

b2PrismaticJoint.prototype['GetUserData'] = b2PrismaticJoint.prototype.GetUserData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PrismaticJoint_GetUserData_0(self), b2JointUserData);
};;

b2PrismaticJoint.prototype['GetCollideConnected'] = b2PrismaticJoint.prototype.GetCollideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2PrismaticJoint_GetCollideConnected_0(self));
};;

  b2PrismaticJoint.prototype['__destroy__'] = b2PrismaticJoint.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2PrismaticJoint___destroy___0(self);
};
// b2PrismaticJointDef
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2PrismaticJointDef() {
  this.ptr = _emscripten_bind_b2PrismaticJointDef_b2PrismaticJointDef_0();
  getCache(b2PrismaticJointDef)[this.ptr] = this;
};;
b2PrismaticJointDef.prototype = Object.create(b2JointDef.prototype);
b2PrismaticJointDef.prototype.constructor = b2PrismaticJointDef;
b2PrismaticJointDef.prototype.__class__ = b2PrismaticJointDef;
b2PrismaticJointDef.__cache__ = {};
Module['b2PrismaticJointDef'] = b2PrismaticJointDef;

b2PrismaticJointDef.prototype['Initialize'] = b2PrismaticJointDef.prototype.Initialize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(bodyA, bodyB, anchor, axis) {
  var self = this.ptr;
  if (bodyA && typeof bodyA === 'object') bodyA = bodyA.ptr;
  if (bodyB && typeof bodyB === 'object') bodyB = bodyB.ptr;
  if (anchor && typeof anchor === 'object') anchor = anchor.ptr;
  if (axis && typeof axis === 'object') axis = axis.ptr;
  _emscripten_bind_b2PrismaticJointDef_Initialize_4(self, bodyA, bodyB, anchor, axis);
};;

  b2PrismaticJointDef.prototype['get_localAnchorA'] = b2PrismaticJointDef.prototype.get_localAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PrismaticJointDef_get_localAnchorA_0(self), b2Vec2);
};
    b2PrismaticJointDef.prototype['set_localAnchorA'] = b2PrismaticJointDef.prototype.set_localAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PrismaticJointDef_set_localAnchorA_1(self, arg0);
};
    Object.defineProperty(b2PrismaticJointDef.prototype, 'localAnchorA', { get: b2PrismaticJointDef.prototype.get_localAnchorA, set: b2PrismaticJointDef.prototype.set_localAnchorA });
  b2PrismaticJointDef.prototype['get_localAnchorB'] = b2PrismaticJointDef.prototype.get_localAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PrismaticJointDef_get_localAnchorB_0(self), b2Vec2);
};
    b2PrismaticJointDef.prototype['set_localAnchorB'] = b2PrismaticJointDef.prototype.set_localAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PrismaticJointDef_set_localAnchorB_1(self, arg0);
};
    Object.defineProperty(b2PrismaticJointDef.prototype, 'localAnchorB', { get: b2PrismaticJointDef.prototype.get_localAnchorB, set: b2PrismaticJointDef.prototype.set_localAnchorB });
  b2PrismaticJointDef.prototype['get_localAxisA'] = b2PrismaticJointDef.prototype.get_localAxisA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PrismaticJointDef_get_localAxisA_0(self), b2Vec2);
};
    b2PrismaticJointDef.prototype['set_localAxisA'] = b2PrismaticJointDef.prototype.set_localAxisA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PrismaticJointDef_set_localAxisA_1(self, arg0);
};
    Object.defineProperty(b2PrismaticJointDef.prototype, 'localAxisA', { get: b2PrismaticJointDef.prototype.get_localAxisA, set: b2PrismaticJointDef.prototype.set_localAxisA });
  b2PrismaticJointDef.prototype['get_referenceAngle'] = b2PrismaticJointDef.prototype.get_referenceAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PrismaticJointDef_get_referenceAngle_0(self);
};
    b2PrismaticJointDef.prototype['set_referenceAngle'] = b2PrismaticJointDef.prototype.set_referenceAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PrismaticJointDef_set_referenceAngle_1(self, arg0);
};
    Object.defineProperty(b2PrismaticJointDef.prototype, 'referenceAngle', { get: b2PrismaticJointDef.prototype.get_referenceAngle, set: b2PrismaticJointDef.prototype.set_referenceAngle });
  b2PrismaticJointDef.prototype['get_enableLimit'] = b2PrismaticJointDef.prototype.get_enableLimit = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2PrismaticJointDef_get_enableLimit_0(self));
};
    b2PrismaticJointDef.prototype['set_enableLimit'] = b2PrismaticJointDef.prototype.set_enableLimit = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PrismaticJointDef_set_enableLimit_1(self, arg0);
};
    Object.defineProperty(b2PrismaticJointDef.prototype, 'enableLimit', { get: b2PrismaticJointDef.prototype.get_enableLimit, set: b2PrismaticJointDef.prototype.set_enableLimit });
  b2PrismaticJointDef.prototype['get_lowerTranslation'] = b2PrismaticJointDef.prototype.get_lowerTranslation = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PrismaticJointDef_get_lowerTranslation_0(self);
};
    b2PrismaticJointDef.prototype['set_lowerTranslation'] = b2PrismaticJointDef.prototype.set_lowerTranslation = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PrismaticJointDef_set_lowerTranslation_1(self, arg0);
};
    Object.defineProperty(b2PrismaticJointDef.prototype, 'lowerTranslation', { get: b2PrismaticJointDef.prototype.get_lowerTranslation, set: b2PrismaticJointDef.prototype.set_lowerTranslation });
  b2PrismaticJointDef.prototype['get_upperTranslation'] = b2PrismaticJointDef.prototype.get_upperTranslation = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PrismaticJointDef_get_upperTranslation_0(self);
};
    b2PrismaticJointDef.prototype['set_upperTranslation'] = b2PrismaticJointDef.prototype.set_upperTranslation = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PrismaticJointDef_set_upperTranslation_1(self, arg0);
};
    Object.defineProperty(b2PrismaticJointDef.prototype, 'upperTranslation', { get: b2PrismaticJointDef.prototype.get_upperTranslation, set: b2PrismaticJointDef.prototype.set_upperTranslation });
  b2PrismaticJointDef.prototype['get_enableMotor'] = b2PrismaticJointDef.prototype.get_enableMotor = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2PrismaticJointDef_get_enableMotor_0(self));
};
    b2PrismaticJointDef.prototype['set_enableMotor'] = b2PrismaticJointDef.prototype.set_enableMotor = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PrismaticJointDef_set_enableMotor_1(self, arg0);
};
    Object.defineProperty(b2PrismaticJointDef.prototype, 'enableMotor', { get: b2PrismaticJointDef.prototype.get_enableMotor, set: b2PrismaticJointDef.prototype.set_enableMotor });
  b2PrismaticJointDef.prototype['get_maxMotorForce'] = b2PrismaticJointDef.prototype.get_maxMotorForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PrismaticJointDef_get_maxMotorForce_0(self);
};
    b2PrismaticJointDef.prototype['set_maxMotorForce'] = b2PrismaticJointDef.prototype.set_maxMotorForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PrismaticJointDef_set_maxMotorForce_1(self, arg0);
};
    Object.defineProperty(b2PrismaticJointDef.prototype, 'maxMotorForce', { get: b2PrismaticJointDef.prototype.get_maxMotorForce, set: b2PrismaticJointDef.prototype.set_maxMotorForce });
  b2PrismaticJointDef.prototype['get_motorSpeed'] = b2PrismaticJointDef.prototype.get_motorSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PrismaticJointDef_get_motorSpeed_0(self);
};
    b2PrismaticJointDef.prototype['set_motorSpeed'] = b2PrismaticJointDef.prototype.set_motorSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PrismaticJointDef_set_motorSpeed_1(self, arg0);
};
    Object.defineProperty(b2PrismaticJointDef.prototype, 'motorSpeed', { get: b2PrismaticJointDef.prototype.get_motorSpeed, set: b2PrismaticJointDef.prototype.set_motorSpeed });
  b2PrismaticJointDef.prototype['get_type'] = b2PrismaticJointDef.prototype.get_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PrismaticJointDef_get_type_0(self);
};
    b2PrismaticJointDef.prototype['set_type'] = b2PrismaticJointDef.prototype.set_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PrismaticJointDef_set_type_1(self, arg0);
};
    Object.defineProperty(b2PrismaticJointDef.prototype, 'type', { get: b2PrismaticJointDef.prototype.get_type, set: b2PrismaticJointDef.prototype.set_type });
  b2PrismaticJointDef.prototype['get_userData'] = b2PrismaticJointDef.prototype.get_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PrismaticJointDef_get_userData_0(self), b2JointUserData);
};
    b2PrismaticJointDef.prototype['set_userData'] = b2PrismaticJointDef.prototype.set_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PrismaticJointDef_set_userData_1(self, arg0);
};
    Object.defineProperty(b2PrismaticJointDef.prototype, 'userData', { get: b2PrismaticJointDef.prototype.get_userData, set: b2PrismaticJointDef.prototype.set_userData });
  b2PrismaticJointDef.prototype['get_bodyA'] = b2PrismaticJointDef.prototype.get_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PrismaticJointDef_get_bodyA_0(self), b2Body);
};
    b2PrismaticJointDef.prototype['set_bodyA'] = b2PrismaticJointDef.prototype.set_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PrismaticJointDef_set_bodyA_1(self, arg0);
};
    Object.defineProperty(b2PrismaticJointDef.prototype, 'bodyA', { get: b2PrismaticJointDef.prototype.get_bodyA, set: b2PrismaticJointDef.prototype.set_bodyA });
  b2PrismaticJointDef.prototype['get_bodyB'] = b2PrismaticJointDef.prototype.get_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PrismaticJointDef_get_bodyB_0(self), b2Body);
};
    b2PrismaticJointDef.prototype['set_bodyB'] = b2PrismaticJointDef.prototype.set_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PrismaticJointDef_set_bodyB_1(self, arg0);
};
    Object.defineProperty(b2PrismaticJointDef.prototype, 'bodyB', { get: b2PrismaticJointDef.prototype.get_bodyB, set: b2PrismaticJointDef.prototype.set_bodyB });
  b2PrismaticJointDef.prototype['get_collideConnected'] = b2PrismaticJointDef.prototype.get_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2PrismaticJointDef_get_collideConnected_0(self));
};
    b2PrismaticJointDef.prototype['set_collideConnected'] = b2PrismaticJointDef.prototype.set_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PrismaticJointDef_set_collideConnected_1(self, arg0);
};
    Object.defineProperty(b2PrismaticJointDef.prototype, 'collideConnected', { get: b2PrismaticJointDef.prototype.get_collideConnected, set: b2PrismaticJointDef.prototype.set_collideConnected });
  b2PrismaticJointDef.prototype['__destroy__'] = b2PrismaticJointDef.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2PrismaticJointDef___destroy___0(self);
};
// b2Profile
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Profile() { throw "cannot construct a b2Profile, no constructor in IDL" }
b2Profile.prototype = Object.create(WrapperObject.prototype);
b2Profile.prototype.constructor = b2Profile;
b2Profile.prototype.__class__ = b2Profile;
b2Profile.__cache__ = {};
Module['b2Profile'] = b2Profile;

  b2Profile.prototype['get_step'] = b2Profile.prototype.get_step = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Profile_get_step_0(self);
};
    b2Profile.prototype['set_step'] = b2Profile.prototype.set_step = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Profile_set_step_1(self, arg0);
};
    Object.defineProperty(b2Profile.prototype, 'step', { get: b2Profile.prototype.get_step, set: b2Profile.prototype.set_step });
  b2Profile.prototype['get_collide'] = b2Profile.prototype.get_collide = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Profile_get_collide_0(self);
};
    b2Profile.prototype['set_collide'] = b2Profile.prototype.set_collide = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Profile_set_collide_1(self, arg0);
};
    Object.defineProperty(b2Profile.prototype, 'collide', { get: b2Profile.prototype.get_collide, set: b2Profile.prototype.set_collide });
  b2Profile.prototype['get_solve'] = b2Profile.prototype.get_solve = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Profile_get_solve_0(self);
};
    b2Profile.prototype['set_solve'] = b2Profile.prototype.set_solve = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Profile_set_solve_1(self, arg0);
};
    Object.defineProperty(b2Profile.prototype, 'solve', { get: b2Profile.prototype.get_solve, set: b2Profile.prototype.set_solve });
  b2Profile.prototype['get_solveInit'] = b2Profile.prototype.get_solveInit = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Profile_get_solveInit_0(self);
};
    b2Profile.prototype['set_solveInit'] = b2Profile.prototype.set_solveInit = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Profile_set_solveInit_1(self, arg0);
};
    Object.defineProperty(b2Profile.prototype, 'solveInit', { get: b2Profile.prototype.get_solveInit, set: b2Profile.prototype.set_solveInit });
  b2Profile.prototype['get_solveVelocity'] = b2Profile.prototype.get_solveVelocity = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Profile_get_solveVelocity_0(self);
};
    b2Profile.prototype['set_solveVelocity'] = b2Profile.prototype.set_solveVelocity = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Profile_set_solveVelocity_1(self, arg0);
};
    Object.defineProperty(b2Profile.prototype, 'solveVelocity', { get: b2Profile.prototype.get_solveVelocity, set: b2Profile.prototype.set_solveVelocity });
  b2Profile.prototype['get_solvePosition'] = b2Profile.prototype.get_solvePosition = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Profile_get_solvePosition_0(self);
};
    b2Profile.prototype['set_solvePosition'] = b2Profile.prototype.set_solvePosition = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Profile_set_solvePosition_1(self, arg0);
};
    Object.defineProperty(b2Profile.prototype, 'solvePosition', { get: b2Profile.prototype.get_solvePosition, set: b2Profile.prototype.set_solvePosition });
  b2Profile.prototype['get_broadphase'] = b2Profile.prototype.get_broadphase = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Profile_get_broadphase_0(self);
};
    b2Profile.prototype['set_broadphase'] = b2Profile.prototype.set_broadphase = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Profile_set_broadphase_1(self, arg0);
};
    Object.defineProperty(b2Profile.prototype, 'broadphase', { get: b2Profile.prototype.get_broadphase, set: b2Profile.prototype.set_broadphase });
  b2Profile.prototype['get_solveTOI'] = b2Profile.prototype.get_solveTOI = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Profile_get_solveTOI_0(self);
};
    b2Profile.prototype['set_solveTOI'] = b2Profile.prototype.set_solveTOI = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Profile_set_solveTOI_1(self, arg0);
};
    Object.defineProperty(b2Profile.prototype, 'solveTOI', { get: b2Profile.prototype.get_solveTOI, set: b2Profile.prototype.set_solveTOI });
  b2Profile.prototype['__destroy__'] = b2Profile.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Profile___destroy___0(self);
};
// b2PulleyJoint
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2PulleyJoint() { throw "cannot construct a b2PulleyJoint, no constructor in IDL" }
b2PulleyJoint.prototype = Object.create(b2Joint.prototype);
b2PulleyJoint.prototype.constructor = b2PulleyJoint;
b2PulleyJoint.prototype.__class__ = b2PulleyJoint;
b2PulleyJoint.__cache__ = {};
Module['b2PulleyJoint'] = b2PulleyJoint;

b2PulleyJoint.prototype['GetGroundAnchorA'] = b2PulleyJoint.prototype.GetGroundAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PulleyJoint_GetGroundAnchorA_0(self), b2Vec2);
};;

b2PulleyJoint.prototype['GetGroundAnchorB'] = b2PulleyJoint.prototype.GetGroundAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PulleyJoint_GetGroundAnchorB_0(self), b2Vec2);
};;

b2PulleyJoint.prototype['GetLengthA'] = b2PulleyJoint.prototype.GetLengthA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PulleyJoint_GetLengthA_0(self);
};;

b2PulleyJoint.prototype['GetLengthB'] = b2PulleyJoint.prototype.GetLengthB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PulleyJoint_GetLengthB_0(self);
};;

b2PulleyJoint.prototype['GetRatio'] = b2PulleyJoint.prototype.GetRatio = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PulleyJoint_GetRatio_0(self);
};;

b2PulleyJoint.prototype['GetCurrentLengthA'] = b2PulleyJoint.prototype.GetCurrentLengthA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PulleyJoint_GetCurrentLengthA_0(self);
};;

b2PulleyJoint.prototype['GetCurrentLengthB'] = b2PulleyJoint.prototype.GetCurrentLengthB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PulleyJoint_GetCurrentLengthB_0(self);
};;

b2PulleyJoint.prototype['GetType'] = b2PulleyJoint.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PulleyJoint_GetType_0(self);
};;

b2PulleyJoint.prototype['GetBodyA'] = b2PulleyJoint.prototype.GetBodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PulleyJoint_GetBodyA_0(self), b2Body);
};;

b2PulleyJoint.prototype['GetBodyB'] = b2PulleyJoint.prototype.GetBodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PulleyJoint_GetBodyB_0(self), b2Body);
};;

b2PulleyJoint.prototype['GetAnchorA'] = b2PulleyJoint.prototype.GetAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PulleyJoint_GetAnchorA_0(self), b2Vec2);
};;

b2PulleyJoint.prototype['GetAnchorB'] = b2PulleyJoint.prototype.GetAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PulleyJoint_GetAnchorB_0(self), b2Vec2);
};;

b2PulleyJoint.prototype['GetReactionForce'] = b2PulleyJoint.prototype.GetReactionForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return wrapPointer(_emscripten_bind_b2PulleyJoint_GetReactionForce_1(self, inv_dt), b2Vec2);
};;

b2PulleyJoint.prototype['GetReactionTorque'] = b2PulleyJoint.prototype.GetReactionTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return _emscripten_bind_b2PulleyJoint_GetReactionTorque_1(self, inv_dt);
};;

b2PulleyJoint.prototype['GetNext'] = b2PulleyJoint.prototype.GetNext = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PulleyJoint_GetNext_0(self), b2Joint);
};;

b2PulleyJoint.prototype['GetUserData'] = b2PulleyJoint.prototype.GetUserData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PulleyJoint_GetUserData_0(self), b2JointUserData);
};;

b2PulleyJoint.prototype['GetCollideConnected'] = b2PulleyJoint.prototype.GetCollideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2PulleyJoint_GetCollideConnected_0(self));
};;

  b2PulleyJoint.prototype['__destroy__'] = b2PulleyJoint.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2PulleyJoint___destroy___0(self);
};
// b2PulleyJointDef
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2PulleyJointDef() {
  this.ptr = _emscripten_bind_b2PulleyJointDef_b2PulleyJointDef_0();
  getCache(b2PulleyJointDef)[this.ptr] = this;
};;
b2PulleyJointDef.prototype = Object.create(b2JointDef.prototype);
b2PulleyJointDef.prototype.constructor = b2PulleyJointDef;
b2PulleyJointDef.prototype.__class__ = b2PulleyJointDef;
b2PulleyJointDef.__cache__ = {};
Module['b2PulleyJointDef'] = b2PulleyJointDef;

b2PulleyJointDef.prototype['Initialize'] = b2PulleyJointDef.prototype.Initialize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(bodyA, bodyB, groundAnchorA, groundAnchorB, anchorA, anchorB, ratio) {
  var self = this.ptr;
  if (bodyA && typeof bodyA === 'object') bodyA = bodyA.ptr;
  if (bodyB && typeof bodyB === 'object') bodyB = bodyB.ptr;
  if (groundAnchorA && typeof groundAnchorA === 'object') groundAnchorA = groundAnchorA.ptr;
  if (groundAnchorB && typeof groundAnchorB === 'object') groundAnchorB = groundAnchorB.ptr;
  if (anchorA && typeof anchorA === 'object') anchorA = anchorA.ptr;
  if (anchorB && typeof anchorB === 'object') anchorB = anchorB.ptr;
  if (ratio && typeof ratio === 'object') ratio = ratio.ptr;
  _emscripten_bind_b2PulleyJointDef_Initialize_7(self, bodyA, bodyB, groundAnchorA, groundAnchorB, anchorA, anchorB, ratio);
};;

  b2PulleyJointDef.prototype['get_groundAnchorA'] = b2PulleyJointDef.prototype.get_groundAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PulleyJointDef_get_groundAnchorA_0(self), b2Vec2);
};
    b2PulleyJointDef.prototype['set_groundAnchorA'] = b2PulleyJointDef.prototype.set_groundAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PulleyJointDef_set_groundAnchorA_1(self, arg0);
};
    Object.defineProperty(b2PulleyJointDef.prototype, 'groundAnchorA', { get: b2PulleyJointDef.prototype.get_groundAnchorA, set: b2PulleyJointDef.prototype.set_groundAnchorA });
  b2PulleyJointDef.prototype['get_groundAnchorB'] = b2PulleyJointDef.prototype.get_groundAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PulleyJointDef_get_groundAnchorB_0(self), b2Vec2);
};
    b2PulleyJointDef.prototype['set_groundAnchorB'] = b2PulleyJointDef.prototype.set_groundAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PulleyJointDef_set_groundAnchorB_1(self, arg0);
};
    Object.defineProperty(b2PulleyJointDef.prototype, 'groundAnchorB', { get: b2PulleyJointDef.prototype.get_groundAnchorB, set: b2PulleyJointDef.prototype.set_groundAnchorB });
  b2PulleyJointDef.prototype['get_localAnchorA'] = b2PulleyJointDef.prototype.get_localAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PulleyJointDef_get_localAnchorA_0(self), b2Vec2);
};
    b2PulleyJointDef.prototype['set_localAnchorA'] = b2PulleyJointDef.prototype.set_localAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PulleyJointDef_set_localAnchorA_1(self, arg0);
};
    Object.defineProperty(b2PulleyJointDef.prototype, 'localAnchorA', { get: b2PulleyJointDef.prototype.get_localAnchorA, set: b2PulleyJointDef.prototype.set_localAnchorA });
  b2PulleyJointDef.prototype['get_localAnchorB'] = b2PulleyJointDef.prototype.get_localAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PulleyJointDef_get_localAnchorB_0(self), b2Vec2);
};
    b2PulleyJointDef.prototype['set_localAnchorB'] = b2PulleyJointDef.prototype.set_localAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PulleyJointDef_set_localAnchorB_1(self, arg0);
};
    Object.defineProperty(b2PulleyJointDef.prototype, 'localAnchorB', { get: b2PulleyJointDef.prototype.get_localAnchorB, set: b2PulleyJointDef.prototype.set_localAnchorB });
  b2PulleyJointDef.prototype['get_lengthA'] = b2PulleyJointDef.prototype.get_lengthA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PulleyJointDef_get_lengthA_0(self);
};
    b2PulleyJointDef.prototype['set_lengthA'] = b2PulleyJointDef.prototype.set_lengthA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PulleyJointDef_set_lengthA_1(self, arg0);
};
    Object.defineProperty(b2PulleyJointDef.prototype, 'lengthA', { get: b2PulleyJointDef.prototype.get_lengthA, set: b2PulleyJointDef.prototype.set_lengthA });
  b2PulleyJointDef.prototype['get_lengthB'] = b2PulleyJointDef.prototype.get_lengthB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PulleyJointDef_get_lengthB_0(self);
};
    b2PulleyJointDef.prototype['set_lengthB'] = b2PulleyJointDef.prototype.set_lengthB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PulleyJointDef_set_lengthB_1(self, arg0);
};
    Object.defineProperty(b2PulleyJointDef.prototype, 'lengthB', { get: b2PulleyJointDef.prototype.get_lengthB, set: b2PulleyJointDef.prototype.set_lengthB });
  b2PulleyJointDef.prototype['get_ratio'] = b2PulleyJointDef.prototype.get_ratio = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PulleyJointDef_get_ratio_0(self);
};
    b2PulleyJointDef.prototype['set_ratio'] = b2PulleyJointDef.prototype.set_ratio = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PulleyJointDef_set_ratio_1(self, arg0);
};
    Object.defineProperty(b2PulleyJointDef.prototype, 'ratio', { get: b2PulleyJointDef.prototype.get_ratio, set: b2PulleyJointDef.prototype.set_ratio });
  b2PulleyJointDef.prototype['get_type'] = b2PulleyJointDef.prototype.get_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2PulleyJointDef_get_type_0(self);
};
    b2PulleyJointDef.prototype['set_type'] = b2PulleyJointDef.prototype.set_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PulleyJointDef_set_type_1(self, arg0);
};
    Object.defineProperty(b2PulleyJointDef.prototype, 'type', { get: b2PulleyJointDef.prototype.get_type, set: b2PulleyJointDef.prototype.set_type });
  b2PulleyJointDef.prototype['get_userData'] = b2PulleyJointDef.prototype.get_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PulleyJointDef_get_userData_0(self), b2JointUserData);
};
    b2PulleyJointDef.prototype['set_userData'] = b2PulleyJointDef.prototype.set_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PulleyJointDef_set_userData_1(self, arg0);
};
    Object.defineProperty(b2PulleyJointDef.prototype, 'userData', { get: b2PulleyJointDef.prototype.get_userData, set: b2PulleyJointDef.prototype.set_userData });
  b2PulleyJointDef.prototype['get_bodyA'] = b2PulleyJointDef.prototype.get_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PulleyJointDef_get_bodyA_0(self), b2Body);
};
    b2PulleyJointDef.prototype['set_bodyA'] = b2PulleyJointDef.prototype.set_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PulleyJointDef_set_bodyA_1(self, arg0);
};
    Object.defineProperty(b2PulleyJointDef.prototype, 'bodyA', { get: b2PulleyJointDef.prototype.get_bodyA, set: b2PulleyJointDef.prototype.set_bodyA });
  b2PulleyJointDef.prototype['get_bodyB'] = b2PulleyJointDef.prototype.get_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2PulleyJointDef_get_bodyB_0(self), b2Body);
};
    b2PulleyJointDef.prototype['set_bodyB'] = b2PulleyJointDef.prototype.set_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PulleyJointDef_set_bodyB_1(self, arg0);
};
    Object.defineProperty(b2PulleyJointDef.prototype, 'bodyB', { get: b2PulleyJointDef.prototype.get_bodyB, set: b2PulleyJointDef.prototype.set_bodyB });
  b2PulleyJointDef.prototype['get_collideConnected'] = b2PulleyJointDef.prototype.get_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2PulleyJointDef_get_collideConnected_0(self));
};
    b2PulleyJointDef.prototype['set_collideConnected'] = b2PulleyJointDef.prototype.set_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2PulleyJointDef_set_collideConnected_1(self, arg0);
};
    Object.defineProperty(b2PulleyJointDef.prototype, 'collideConnected', { get: b2PulleyJointDef.prototype.get_collideConnected, set: b2PulleyJointDef.prototype.set_collideConnected });
  b2PulleyJointDef.prototype['__destroy__'] = b2PulleyJointDef.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2PulleyJointDef___destroy___0(self);
};
// b2RayCastInput
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2RayCastInput() { throw "cannot construct a b2RayCastInput, no constructor in IDL" }
b2RayCastInput.prototype = Object.create(WrapperObject.prototype);
b2RayCastInput.prototype.constructor = b2RayCastInput;
b2RayCastInput.prototype.__class__ = b2RayCastInput;
b2RayCastInput.__cache__ = {};
Module['b2RayCastInput'] = b2RayCastInput;

  b2RayCastInput.prototype['get_p1'] = b2RayCastInput.prototype.get_p1 = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RayCastInput_get_p1_0(self), b2Vec2);
};
    b2RayCastInput.prototype['set_p1'] = b2RayCastInput.prototype.set_p1 = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RayCastInput_set_p1_1(self, arg0);
};
    Object.defineProperty(b2RayCastInput.prototype, 'p1', { get: b2RayCastInput.prototype.get_p1, set: b2RayCastInput.prototype.set_p1 });
  b2RayCastInput.prototype['get_p2'] = b2RayCastInput.prototype.get_p2 = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RayCastInput_get_p2_0(self), b2Vec2);
};
    b2RayCastInput.prototype['set_p2'] = b2RayCastInput.prototype.set_p2 = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RayCastInput_set_p2_1(self, arg0);
};
    Object.defineProperty(b2RayCastInput.prototype, 'p2', { get: b2RayCastInput.prototype.get_p2, set: b2RayCastInput.prototype.set_p2 });
  b2RayCastInput.prototype['get_maxFraction'] = b2RayCastInput.prototype.get_maxFraction = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RayCastInput_get_maxFraction_0(self);
};
    b2RayCastInput.prototype['set_maxFraction'] = b2RayCastInput.prototype.set_maxFraction = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RayCastInput_set_maxFraction_1(self, arg0);
};
    Object.defineProperty(b2RayCastInput.prototype, 'maxFraction', { get: b2RayCastInput.prototype.get_maxFraction, set: b2RayCastInput.prototype.set_maxFraction });
  b2RayCastInput.prototype['__destroy__'] = b2RayCastInput.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2RayCastInput___destroy___0(self);
};
// b2RayCastOutput
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2RayCastOutput() { throw "cannot construct a b2RayCastOutput, no constructor in IDL" }
b2RayCastOutput.prototype = Object.create(WrapperObject.prototype);
b2RayCastOutput.prototype.constructor = b2RayCastOutput;
b2RayCastOutput.prototype.__class__ = b2RayCastOutput;
b2RayCastOutput.__cache__ = {};
Module['b2RayCastOutput'] = b2RayCastOutput;

  b2RayCastOutput.prototype['get_normal'] = b2RayCastOutput.prototype.get_normal = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RayCastOutput_get_normal_0(self), b2Vec2);
};
    b2RayCastOutput.prototype['set_normal'] = b2RayCastOutput.prototype.set_normal = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RayCastOutput_set_normal_1(self, arg0);
};
    Object.defineProperty(b2RayCastOutput.prototype, 'normal', { get: b2RayCastOutput.prototype.get_normal, set: b2RayCastOutput.prototype.set_normal });
  b2RayCastOutput.prototype['get_fraction'] = b2RayCastOutput.prototype.get_fraction = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RayCastOutput_get_fraction_0(self);
};
    b2RayCastOutput.prototype['set_fraction'] = b2RayCastOutput.prototype.set_fraction = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RayCastOutput_set_fraction_1(self, arg0);
};
    Object.defineProperty(b2RayCastOutput.prototype, 'fraction', { get: b2RayCastOutput.prototype.get_fraction, set: b2RayCastOutput.prototype.set_fraction });
  b2RayCastOutput.prototype['__destroy__'] = b2RayCastOutput.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2RayCastOutput___destroy___0(self);
};
// b2RevoluteJoint
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2RevoluteJoint() { throw "cannot construct a b2RevoluteJoint, no constructor in IDL" }
b2RevoluteJoint.prototype = Object.create(b2Joint.prototype);
b2RevoluteJoint.prototype.constructor = b2RevoluteJoint;
b2RevoluteJoint.prototype.__class__ = b2RevoluteJoint;
b2RevoluteJoint.__cache__ = {};
Module['b2RevoluteJoint'] = b2RevoluteJoint;

b2RevoluteJoint.prototype['GetLocalAnchorA'] = b2RevoluteJoint.prototype.GetLocalAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RevoluteJoint_GetLocalAnchorA_0(self), b2Vec2);
};;

b2RevoluteJoint.prototype['GetLocalAnchorB'] = b2RevoluteJoint.prototype.GetLocalAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RevoluteJoint_GetLocalAnchorB_0(self), b2Vec2);
};;

b2RevoluteJoint.prototype['GetReferenceAngle'] = b2RevoluteJoint.prototype.GetReferenceAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RevoluteJoint_GetReferenceAngle_0(self);
};;

b2RevoluteJoint.prototype['GetJointAngle'] = b2RevoluteJoint.prototype.GetJointAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RevoluteJoint_GetJointAngle_0(self);
};;

b2RevoluteJoint.prototype['GetJointSpeed'] = b2RevoluteJoint.prototype.GetJointSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RevoluteJoint_GetJointSpeed_0(self);
};;

b2RevoluteJoint.prototype['IsLimitEnabled'] = b2RevoluteJoint.prototype.IsLimitEnabled = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2RevoluteJoint_IsLimitEnabled_0(self));
};;

b2RevoluteJoint.prototype['EnableLimit'] = b2RevoluteJoint.prototype.EnableLimit = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2RevoluteJoint_EnableLimit_1(self, flag);
};;

b2RevoluteJoint.prototype['GetLowerLimit'] = b2RevoluteJoint.prototype.GetLowerLimit = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RevoluteJoint_GetLowerLimit_0(self);
};;

b2RevoluteJoint.prototype['GetUpperLimit'] = b2RevoluteJoint.prototype.GetUpperLimit = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RevoluteJoint_GetUpperLimit_0(self);
};;

b2RevoluteJoint.prototype['SetLimits'] = b2RevoluteJoint.prototype.SetLimits = /** @suppress {undefinedVars, duplicate} @this{Object} */function(lower, upper) {
  var self = this.ptr;
  if (lower && typeof lower === 'object') lower = lower.ptr;
  if (upper && typeof upper === 'object') upper = upper.ptr;
  _emscripten_bind_b2RevoluteJoint_SetLimits_2(self, lower, upper);
};;

b2RevoluteJoint.prototype['IsMotorEnabled'] = b2RevoluteJoint.prototype.IsMotorEnabled = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2RevoluteJoint_IsMotorEnabled_0(self));
};;

b2RevoluteJoint.prototype['EnableMotor'] = b2RevoluteJoint.prototype.EnableMotor = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2RevoluteJoint_EnableMotor_1(self, flag);
};;

b2RevoluteJoint.prototype['SetMotorSpeed'] = b2RevoluteJoint.prototype.SetMotorSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function(speed) {
  var self = this.ptr;
  if (speed && typeof speed === 'object') speed = speed.ptr;
  _emscripten_bind_b2RevoluteJoint_SetMotorSpeed_1(self, speed);
};;

b2RevoluteJoint.prototype['GetMotorSpeed'] = b2RevoluteJoint.prototype.GetMotorSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RevoluteJoint_GetMotorSpeed_0(self);
};;

b2RevoluteJoint.prototype['SetMaxMotorTorque'] = b2RevoluteJoint.prototype.SetMaxMotorTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(torque) {
  var self = this.ptr;
  if (torque && typeof torque === 'object') torque = torque.ptr;
  _emscripten_bind_b2RevoluteJoint_SetMaxMotorTorque_1(self, torque);
};;

b2RevoluteJoint.prototype['GetMaxMotorTorque'] = b2RevoluteJoint.prototype.GetMaxMotorTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RevoluteJoint_GetMaxMotorTorque_0(self);
};;

b2RevoluteJoint.prototype['GetMotorTorque'] = b2RevoluteJoint.prototype.GetMotorTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return _emscripten_bind_b2RevoluteJoint_GetMotorTorque_1(self, inv_dt);
};;

b2RevoluteJoint.prototype['GetType'] = b2RevoluteJoint.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RevoluteJoint_GetType_0(self);
};;

b2RevoluteJoint.prototype['GetBodyA'] = b2RevoluteJoint.prototype.GetBodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RevoluteJoint_GetBodyA_0(self), b2Body);
};;

b2RevoluteJoint.prototype['GetBodyB'] = b2RevoluteJoint.prototype.GetBodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RevoluteJoint_GetBodyB_0(self), b2Body);
};;

b2RevoluteJoint.prototype['GetAnchorA'] = b2RevoluteJoint.prototype.GetAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RevoluteJoint_GetAnchorA_0(self), b2Vec2);
};;

b2RevoluteJoint.prototype['GetAnchorB'] = b2RevoluteJoint.prototype.GetAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RevoluteJoint_GetAnchorB_0(self), b2Vec2);
};;

b2RevoluteJoint.prototype['GetReactionForce'] = b2RevoluteJoint.prototype.GetReactionForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return wrapPointer(_emscripten_bind_b2RevoluteJoint_GetReactionForce_1(self, inv_dt), b2Vec2);
};;

b2RevoluteJoint.prototype['GetReactionTorque'] = b2RevoluteJoint.prototype.GetReactionTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return _emscripten_bind_b2RevoluteJoint_GetReactionTorque_1(self, inv_dt);
};;

b2RevoluteJoint.prototype['GetNext'] = b2RevoluteJoint.prototype.GetNext = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RevoluteJoint_GetNext_0(self), b2Joint);
};;

b2RevoluteJoint.prototype['GetUserData'] = b2RevoluteJoint.prototype.GetUserData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RevoluteJoint_GetUserData_0(self), b2JointUserData);
};;

b2RevoluteJoint.prototype['GetCollideConnected'] = b2RevoluteJoint.prototype.GetCollideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2RevoluteJoint_GetCollideConnected_0(self));
};;

  b2RevoluteJoint.prototype['__destroy__'] = b2RevoluteJoint.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2RevoluteJoint___destroy___0(self);
};
// b2RevoluteJointDef
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2RevoluteJointDef() {
  this.ptr = _emscripten_bind_b2RevoluteJointDef_b2RevoluteJointDef_0();
  getCache(b2RevoluteJointDef)[this.ptr] = this;
};;
b2RevoluteJointDef.prototype = Object.create(b2JointDef.prototype);
b2RevoluteJointDef.prototype.constructor = b2RevoluteJointDef;
b2RevoluteJointDef.prototype.__class__ = b2RevoluteJointDef;
b2RevoluteJointDef.__cache__ = {};
Module['b2RevoluteJointDef'] = b2RevoluteJointDef;

b2RevoluteJointDef.prototype['Initialize'] = b2RevoluteJointDef.prototype.Initialize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(bodyA, bodyB, anchor) {
  var self = this.ptr;
  if (bodyA && typeof bodyA === 'object') bodyA = bodyA.ptr;
  if (bodyB && typeof bodyB === 'object') bodyB = bodyB.ptr;
  if (anchor && typeof anchor === 'object') anchor = anchor.ptr;
  _emscripten_bind_b2RevoluteJointDef_Initialize_3(self, bodyA, bodyB, anchor);
};;

  b2RevoluteJointDef.prototype['get_localAnchorA'] = b2RevoluteJointDef.prototype.get_localAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RevoluteJointDef_get_localAnchorA_0(self), b2Vec2);
};
    b2RevoluteJointDef.prototype['set_localAnchorA'] = b2RevoluteJointDef.prototype.set_localAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RevoluteJointDef_set_localAnchorA_1(self, arg0);
};
    Object.defineProperty(b2RevoluteJointDef.prototype, 'localAnchorA', { get: b2RevoluteJointDef.prototype.get_localAnchorA, set: b2RevoluteJointDef.prototype.set_localAnchorA });
  b2RevoluteJointDef.prototype['get_localAnchorB'] = b2RevoluteJointDef.prototype.get_localAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RevoluteJointDef_get_localAnchorB_0(self), b2Vec2);
};
    b2RevoluteJointDef.prototype['set_localAnchorB'] = b2RevoluteJointDef.prototype.set_localAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RevoluteJointDef_set_localAnchorB_1(self, arg0);
};
    Object.defineProperty(b2RevoluteJointDef.prototype, 'localAnchorB', { get: b2RevoluteJointDef.prototype.get_localAnchorB, set: b2RevoluteJointDef.prototype.set_localAnchorB });
  b2RevoluteJointDef.prototype['get_referenceAngle'] = b2RevoluteJointDef.prototype.get_referenceAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RevoluteJointDef_get_referenceAngle_0(self);
};
    b2RevoluteJointDef.prototype['set_referenceAngle'] = b2RevoluteJointDef.prototype.set_referenceAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RevoluteJointDef_set_referenceAngle_1(self, arg0);
};
    Object.defineProperty(b2RevoluteJointDef.prototype, 'referenceAngle', { get: b2RevoluteJointDef.prototype.get_referenceAngle, set: b2RevoluteJointDef.prototype.set_referenceAngle });
  b2RevoluteJointDef.prototype['get_enableLimit'] = b2RevoluteJointDef.prototype.get_enableLimit = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2RevoluteJointDef_get_enableLimit_0(self));
};
    b2RevoluteJointDef.prototype['set_enableLimit'] = b2RevoluteJointDef.prototype.set_enableLimit = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RevoluteJointDef_set_enableLimit_1(self, arg0);
};
    Object.defineProperty(b2RevoluteJointDef.prototype, 'enableLimit', { get: b2RevoluteJointDef.prototype.get_enableLimit, set: b2RevoluteJointDef.prototype.set_enableLimit });
  b2RevoluteJointDef.prototype['get_lowerAngle'] = b2RevoluteJointDef.prototype.get_lowerAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RevoluteJointDef_get_lowerAngle_0(self);
};
    b2RevoluteJointDef.prototype['set_lowerAngle'] = b2RevoluteJointDef.prototype.set_lowerAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RevoluteJointDef_set_lowerAngle_1(self, arg0);
};
    Object.defineProperty(b2RevoluteJointDef.prototype, 'lowerAngle', { get: b2RevoluteJointDef.prototype.get_lowerAngle, set: b2RevoluteJointDef.prototype.set_lowerAngle });
  b2RevoluteJointDef.prototype['get_upperAngle'] = b2RevoluteJointDef.prototype.get_upperAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RevoluteJointDef_get_upperAngle_0(self);
};
    b2RevoluteJointDef.prototype['set_upperAngle'] = b2RevoluteJointDef.prototype.set_upperAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RevoluteJointDef_set_upperAngle_1(self, arg0);
};
    Object.defineProperty(b2RevoluteJointDef.prototype, 'upperAngle', { get: b2RevoluteJointDef.prototype.get_upperAngle, set: b2RevoluteJointDef.prototype.set_upperAngle });
  b2RevoluteJointDef.prototype['get_enableMotor'] = b2RevoluteJointDef.prototype.get_enableMotor = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2RevoluteJointDef_get_enableMotor_0(self));
};
    b2RevoluteJointDef.prototype['set_enableMotor'] = b2RevoluteJointDef.prototype.set_enableMotor = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RevoluteJointDef_set_enableMotor_1(self, arg0);
};
    Object.defineProperty(b2RevoluteJointDef.prototype, 'enableMotor', { get: b2RevoluteJointDef.prototype.get_enableMotor, set: b2RevoluteJointDef.prototype.set_enableMotor });
  b2RevoluteJointDef.prototype['get_motorSpeed'] = b2RevoluteJointDef.prototype.get_motorSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RevoluteJointDef_get_motorSpeed_0(self);
};
    b2RevoluteJointDef.prototype['set_motorSpeed'] = b2RevoluteJointDef.prototype.set_motorSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RevoluteJointDef_set_motorSpeed_1(self, arg0);
};
    Object.defineProperty(b2RevoluteJointDef.prototype, 'motorSpeed', { get: b2RevoluteJointDef.prototype.get_motorSpeed, set: b2RevoluteJointDef.prototype.set_motorSpeed });
  b2RevoluteJointDef.prototype['get_maxMotorTorque'] = b2RevoluteJointDef.prototype.get_maxMotorTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RevoluteJointDef_get_maxMotorTorque_0(self);
};
    b2RevoluteJointDef.prototype['set_maxMotorTorque'] = b2RevoluteJointDef.prototype.set_maxMotorTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RevoluteJointDef_set_maxMotorTorque_1(self, arg0);
};
    Object.defineProperty(b2RevoluteJointDef.prototype, 'maxMotorTorque', { get: b2RevoluteJointDef.prototype.get_maxMotorTorque, set: b2RevoluteJointDef.prototype.set_maxMotorTorque });
  b2RevoluteJointDef.prototype['get_type'] = b2RevoluteJointDef.prototype.get_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RevoluteJointDef_get_type_0(self);
};
    b2RevoluteJointDef.prototype['set_type'] = b2RevoluteJointDef.prototype.set_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RevoluteJointDef_set_type_1(self, arg0);
};
    Object.defineProperty(b2RevoluteJointDef.prototype, 'type', { get: b2RevoluteJointDef.prototype.get_type, set: b2RevoluteJointDef.prototype.set_type });
  b2RevoluteJointDef.prototype['get_userData'] = b2RevoluteJointDef.prototype.get_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RevoluteJointDef_get_userData_0(self), b2JointUserData);
};
    b2RevoluteJointDef.prototype['set_userData'] = b2RevoluteJointDef.prototype.set_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RevoluteJointDef_set_userData_1(self, arg0);
};
    Object.defineProperty(b2RevoluteJointDef.prototype, 'userData', { get: b2RevoluteJointDef.prototype.get_userData, set: b2RevoluteJointDef.prototype.set_userData });
  b2RevoluteJointDef.prototype['get_bodyA'] = b2RevoluteJointDef.prototype.get_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RevoluteJointDef_get_bodyA_0(self), b2Body);
};
    b2RevoluteJointDef.prototype['set_bodyA'] = b2RevoluteJointDef.prototype.set_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RevoluteJointDef_set_bodyA_1(self, arg0);
};
    Object.defineProperty(b2RevoluteJointDef.prototype, 'bodyA', { get: b2RevoluteJointDef.prototype.get_bodyA, set: b2RevoluteJointDef.prototype.set_bodyA });
  b2RevoluteJointDef.prototype['get_bodyB'] = b2RevoluteJointDef.prototype.get_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RevoluteJointDef_get_bodyB_0(self), b2Body);
};
    b2RevoluteJointDef.prototype['set_bodyB'] = b2RevoluteJointDef.prototype.set_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RevoluteJointDef_set_bodyB_1(self, arg0);
};
    Object.defineProperty(b2RevoluteJointDef.prototype, 'bodyB', { get: b2RevoluteJointDef.prototype.get_bodyB, set: b2RevoluteJointDef.prototype.set_bodyB });
  b2RevoluteJointDef.prototype['get_collideConnected'] = b2RevoluteJointDef.prototype.get_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2RevoluteJointDef_get_collideConnected_0(self));
};
    b2RevoluteJointDef.prototype['set_collideConnected'] = b2RevoluteJointDef.prototype.set_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RevoluteJointDef_set_collideConnected_1(self, arg0);
};
    Object.defineProperty(b2RevoluteJointDef.prototype, 'collideConnected', { get: b2RevoluteJointDef.prototype.get_collideConnected, set: b2RevoluteJointDef.prototype.set_collideConnected });
  b2RevoluteJointDef.prototype['__destroy__'] = b2RevoluteJointDef.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2RevoluteJointDef___destroy___0(self);
};
// b2Rot
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Rot(angle) {
  if (angle && typeof angle === 'object') angle = angle.ptr;
  if (angle === undefined) { this.ptr = _emscripten_bind_b2Rot_b2Rot_0(); getCache(b2Rot)[this.ptr] = this;return }
  this.ptr = _emscripten_bind_b2Rot_b2Rot_1(angle);
  getCache(b2Rot)[this.ptr] = this;
};;
b2Rot.prototype = Object.create(WrapperObject.prototype);
b2Rot.prototype.constructor = b2Rot;
b2Rot.prototype.__class__ = b2Rot;
b2Rot.__cache__ = {};
Module['b2Rot'] = b2Rot;

b2Rot.prototype['Set'] = b2Rot.prototype.Set = /** @suppress {undefinedVars, duplicate} @this{Object} */function(angle) {
  var self = this.ptr;
  if (angle && typeof angle === 'object') angle = angle.ptr;
  _emscripten_bind_b2Rot_Set_1(self, angle);
};;

b2Rot.prototype['SetIdentity'] = b2Rot.prototype.SetIdentity = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Rot_SetIdentity_0(self);
};;

b2Rot.prototype['GetAngle'] = b2Rot.prototype.GetAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Rot_GetAngle_0(self);
};;

b2Rot.prototype['GetXAxis'] = b2Rot.prototype.GetXAxis = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Rot_GetXAxis_0(self), b2Vec2);
};;

b2Rot.prototype['GetYAxis'] = b2Rot.prototype.GetYAxis = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2Rot_GetYAxis_0(self), b2Vec2);
};;

  b2Rot.prototype['get_s'] = b2Rot.prototype.get_s = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Rot_get_s_0(self);
};
    b2Rot.prototype['set_s'] = b2Rot.prototype.set_s = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Rot_set_s_1(self, arg0);
};
    Object.defineProperty(b2Rot.prototype, 's', { get: b2Rot.prototype.get_s, set: b2Rot.prototype.set_s });
  b2Rot.prototype['get_c'] = b2Rot.prototype.get_c = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2Rot_get_c_0(self);
};
    b2Rot.prototype['set_c'] = b2Rot.prototype.set_c = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2Rot_set_c_1(self, arg0);
};
    Object.defineProperty(b2Rot.prototype, 'c', { get: b2Rot.prototype.get_c, set: b2Rot.prototype.set_c });
  b2Rot.prototype['__destroy__'] = b2Rot.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Rot___destroy___0(self);
};
// b2WheelJoint
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2WheelJoint() { throw "cannot construct a b2WheelJoint, no constructor in IDL" }
b2WheelJoint.prototype = Object.create(b2Joint.prototype);
b2WheelJoint.prototype.constructor = b2WheelJoint;
b2WheelJoint.prototype.__class__ = b2WheelJoint;
b2WheelJoint.__cache__ = {};
Module['b2WheelJoint'] = b2WheelJoint;

b2WheelJoint.prototype['GetLocalAnchorA'] = b2WheelJoint.prototype.GetLocalAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WheelJoint_GetLocalAnchorA_0(self), b2Vec2);
};;

b2WheelJoint.prototype['GetLocalAnchorB'] = b2WheelJoint.prototype.GetLocalAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WheelJoint_GetLocalAnchorB_0(self), b2Vec2);
};;

b2WheelJoint.prototype['GetLocalAxisA'] = b2WheelJoint.prototype.GetLocalAxisA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WheelJoint_GetLocalAxisA_0(self), b2Vec2);
};;

b2WheelJoint.prototype['GetJointTranslation'] = b2WheelJoint.prototype.GetJointTranslation = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJoint_GetJointTranslation_0(self);
};;

b2WheelJoint.prototype['GetJointLinearSpeed'] = b2WheelJoint.prototype.GetJointLinearSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJoint_GetJointLinearSpeed_0(self);
};;

b2WheelJoint.prototype['GetJointAngle'] = b2WheelJoint.prototype.GetJointAngle = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJoint_GetJointAngle_0(self);
};;

b2WheelJoint.prototype['GetJointAngularSpeed'] = b2WheelJoint.prototype.GetJointAngularSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJoint_GetJointAngularSpeed_0(self);
};;

b2WheelJoint.prototype['IsLimitEnabled'] = b2WheelJoint.prototype.IsLimitEnabled = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2WheelJoint_IsLimitEnabled_0(self));
};;

b2WheelJoint.prototype['EnableLimit'] = b2WheelJoint.prototype.EnableLimit = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2WheelJoint_EnableLimit_1(self, flag);
};;

b2WheelJoint.prototype['GetLowerLimit'] = b2WheelJoint.prototype.GetLowerLimit = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJoint_GetLowerLimit_0(self);
};;

b2WheelJoint.prototype['GetUpperLimit'] = b2WheelJoint.prototype.GetUpperLimit = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJoint_GetUpperLimit_0(self);
};;

b2WheelJoint.prototype['SetLimits'] = b2WheelJoint.prototype.SetLimits = /** @suppress {undefinedVars, duplicate} @this{Object} */function(lower, upper) {
  var self = this.ptr;
  if (lower && typeof lower === 'object') lower = lower.ptr;
  if (upper && typeof upper === 'object') upper = upper.ptr;
  _emscripten_bind_b2WheelJoint_SetLimits_2(self, lower, upper);
};;

b2WheelJoint.prototype['IsMotorEnabled'] = b2WheelJoint.prototype.IsMotorEnabled = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2WheelJoint_IsMotorEnabled_0(self));
};;

b2WheelJoint.prototype['EnableMotor'] = b2WheelJoint.prototype.EnableMotor = /** @suppress {undefinedVars, duplicate} @this{Object} */function(flag) {
  var self = this.ptr;
  if (flag && typeof flag === 'object') flag = flag.ptr;
  _emscripten_bind_b2WheelJoint_EnableMotor_1(self, flag);
};;

b2WheelJoint.prototype['SetMotorSpeed'] = b2WheelJoint.prototype.SetMotorSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function(speed) {
  var self = this.ptr;
  if (speed && typeof speed === 'object') speed = speed.ptr;
  _emscripten_bind_b2WheelJoint_SetMotorSpeed_1(self, speed);
};;

b2WheelJoint.prototype['GetMotorSpeed'] = b2WheelJoint.prototype.GetMotorSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJoint_GetMotorSpeed_0(self);
};;

b2WheelJoint.prototype['SetMaxMotorTorque'] = b2WheelJoint.prototype.SetMaxMotorTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(torque) {
  var self = this.ptr;
  if (torque && typeof torque === 'object') torque = torque.ptr;
  _emscripten_bind_b2WheelJoint_SetMaxMotorTorque_1(self, torque);
};;

b2WheelJoint.prototype['GetMaxMotorTorque'] = b2WheelJoint.prototype.GetMaxMotorTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJoint_GetMaxMotorTorque_0(self);
};;

b2WheelJoint.prototype['GetMotorTorque'] = b2WheelJoint.prototype.GetMotorTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return _emscripten_bind_b2WheelJoint_GetMotorTorque_1(self, inv_dt);
};;

b2WheelJoint.prototype['SetStiffness'] = b2WheelJoint.prototype.SetStiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function(stiffness) {
  var self = this.ptr;
  if (stiffness && typeof stiffness === 'object') stiffness = stiffness.ptr;
  _emscripten_bind_b2WheelJoint_SetStiffness_1(self, stiffness);
};;

b2WheelJoint.prototype['GetStiffness'] = b2WheelJoint.prototype.GetStiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJoint_GetStiffness_0(self);
};;

b2WheelJoint.prototype['SetDamping'] = b2WheelJoint.prototype.SetDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(damping) {
  var self = this.ptr;
  if (damping && typeof damping === 'object') damping = damping.ptr;
  _emscripten_bind_b2WheelJoint_SetDamping_1(self, damping);
};;

b2WheelJoint.prototype['GetDamping'] = b2WheelJoint.prototype.GetDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJoint_GetDamping_0(self);
};;

b2WheelJoint.prototype['GetType'] = b2WheelJoint.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJoint_GetType_0(self);
};;

b2WheelJoint.prototype['GetBodyA'] = b2WheelJoint.prototype.GetBodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WheelJoint_GetBodyA_0(self), b2Body);
};;

b2WheelJoint.prototype['GetBodyB'] = b2WheelJoint.prototype.GetBodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WheelJoint_GetBodyB_0(self), b2Body);
};;

b2WheelJoint.prototype['GetAnchorA'] = b2WheelJoint.prototype.GetAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WheelJoint_GetAnchorA_0(self), b2Vec2);
};;

b2WheelJoint.prototype['GetAnchorB'] = b2WheelJoint.prototype.GetAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WheelJoint_GetAnchorB_0(self), b2Vec2);
};;

b2WheelJoint.prototype['GetReactionForce'] = b2WheelJoint.prototype.GetReactionForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return wrapPointer(_emscripten_bind_b2WheelJoint_GetReactionForce_1(self, inv_dt), b2Vec2);
};;

b2WheelJoint.prototype['GetReactionTorque'] = b2WheelJoint.prototype.GetReactionTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return _emscripten_bind_b2WheelJoint_GetReactionTorque_1(self, inv_dt);
};;

b2WheelJoint.prototype['GetNext'] = b2WheelJoint.prototype.GetNext = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WheelJoint_GetNext_0(self), b2Joint);
};;

b2WheelJoint.prototype['GetUserData'] = b2WheelJoint.prototype.GetUserData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WheelJoint_GetUserData_0(self), b2JointUserData);
};;

b2WheelJoint.prototype['GetCollideConnected'] = b2WheelJoint.prototype.GetCollideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2WheelJoint_GetCollideConnected_0(self));
};;

  b2WheelJoint.prototype['__destroy__'] = b2WheelJoint.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2WheelJoint___destroy___0(self);
};
// b2WheelJointDef
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2WheelJointDef() {
  this.ptr = _emscripten_bind_b2WheelJointDef_b2WheelJointDef_0();
  getCache(b2WheelJointDef)[this.ptr] = this;
};;
b2WheelJointDef.prototype = Object.create(b2JointDef.prototype);
b2WheelJointDef.prototype.constructor = b2WheelJointDef;
b2WheelJointDef.prototype.__class__ = b2WheelJointDef;
b2WheelJointDef.__cache__ = {};
Module['b2WheelJointDef'] = b2WheelJointDef;

b2WheelJointDef.prototype['Initialize'] = b2WheelJointDef.prototype.Initialize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(bodyA, bodyB, anchor, axis) {
  var self = this.ptr;
  if (bodyA && typeof bodyA === 'object') bodyA = bodyA.ptr;
  if (bodyB && typeof bodyB === 'object') bodyB = bodyB.ptr;
  if (anchor && typeof anchor === 'object') anchor = anchor.ptr;
  if (axis && typeof axis === 'object') axis = axis.ptr;
  _emscripten_bind_b2WheelJointDef_Initialize_4(self, bodyA, bodyB, anchor, axis);
};;

  b2WheelJointDef.prototype['get_localAnchorA'] = b2WheelJointDef.prototype.get_localAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WheelJointDef_get_localAnchorA_0(self), b2Vec2);
};
    b2WheelJointDef.prototype['set_localAnchorA'] = b2WheelJointDef.prototype.set_localAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WheelJointDef_set_localAnchorA_1(self, arg0);
};
    Object.defineProperty(b2WheelJointDef.prototype, 'localAnchorA', { get: b2WheelJointDef.prototype.get_localAnchorA, set: b2WheelJointDef.prototype.set_localAnchorA });
  b2WheelJointDef.prototype['get_localAnchorB'] = b2WheelJointDef.prototype.get_localAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WheelJointDef_get_localAnchorB_0(self), b2Vec2);
};
    b2WheelJointDef.prototype['set_localAnchorB'] = b2WheelJointDef.prototype.set_localAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WheelJointDef_set_localAnchorB_1(self, arg0);
};
    Object.defineProperty(b2WheelJointDef.prototype, 'localAnchorB', { get: b2WheelJointDef.prototype.get_localAnchorB, set: b2WheelJointDef.prototype.set_localAnchorB });
  b2WheelJointDef.prototype['get_localAxisA'] = b2WheelJointDef.prototype.get_localAxisA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WheelJointDef_get_localAxisA_0(self), b2Vec2);
};
    b2WheelJointDef.prototype['set_localAxisA'] = b2WheelJointDef.prototype.set_localAxisA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WheelJointDef_set_localAxisA_1(self, arg0);
};
    Object.defineProperty(b2WheelJointDef.prototype, 'localAxisA', { get: b2WheelJointDef.prototype.get_localAxisA, set: b2WheelJointDef.prototype.set_localAxisA });
  b2WheelJointDef.prototype['get_enableLimit'] = b2WheelJointDef.prototype.get_enableLimit = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2WheelJointDef_get_enableLimit_0(self));
};
    b2WheelJointDef.prototype['set_enableLimit'] = b2WheelJointDef.prototype.set_enableLimit = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WheelJointDef_set_enableLimit_1(self, arg0);
};
    Object.defineProperty(b2WheelJointDef.prototype, 'enableLimit', { get: b2WheelJointDef.prototype.get_enableLimit, set: b2WheelJointDef.prototype.set_enableLimit });
  b2WheelJointDef.prototype['get_lowerTranslation'] = b2WheelJointDef.prototype.get_lowerTranslation = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJointDef_get_lowerTranslation_0(self);
};
    b2WheelJointDef.prototype['set_lowerTranslation'] = b2WheelJointDef.prototype.set_lowerTranslation = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WheelJointDef_set_lowerTranslation_1(self, arg0);
};
    Object.defineProperty(b2WheelJointDef.prototype, 'lowerTranslation', { get: b2WheelJointDef.prototype.get_lowerTranslation, set: b2WheelJointDef.prototype.set_lowerTranslation });
  b2WheelJointDef.prototype['get_upperTranslation'] = b2WheelJointDef.prototype.get_upperTranslation = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJointDef_get_upperTranslation_0(self);
};
    b2WheelJointDef.prototype['set_upperTranslation'] = b2WheelJointDef.prototype.set_upperTranslation = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WheelJointDef_set_upperTranslation_1(self, arg0);
};
    Object.defineProperty(b2WheelJointDef.prototype, 'upperTranslation', { get: b2WheelJointDef.prototype.get_upperTranslation, set: b2WheelJointDef.prototype.set_upperTranslation });
  b2WheelJointDef.prototype['get_enableMotor'] = b2WheelJointDef.prototype.get_enableMotor = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2WheelJointDef_get_enableMotor_0(self));
};
    b2WheelJointDef.prototype['set_enableMotor'] = b2WheelJointDef.prototype.set_enableMotor = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WheelJointDef_set_enableMotor_1(self, arg0);
};
    Object.defineProperty(b2WheelJointDef.prototype, 'enableMotor', { get: b2WheelJointDef.prototype.get_enableMotor, set: b2WheelJointDef.prototype.set_enableMotor });
  b2WheelJointDef.prototype['get_maxMotorTorque'] = b2WheelJointDef.prototype.get_maxMotorTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJointDef_get_maxMotorTorque_0(self);
};
    b2WheelJointDef.prototype['set_maxMotorTorque'] = b2WheelJointDef.prototype.set_maxMotorTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WheelJointDef_set_maxMotorTorque_1(self, arg0);
};
    Object.defineProperty(b2WheelJointDef.prototype, 'maxMotorTorque', { get: b2WheelJointDef.prototype.get_maxMotorTorque, set: b2WheelJointDef.prototype.set_maxMotorTorque });
  b2WheelJointDef.prototype['get_motorSpeed'] = b2WheelJointDef.prototype.get_motorSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJointDef_get_motorSpeed_0(self);
};
    b2WheelJointDef.prototype['set_motorSpeed'] = b2WheelJointDef.prototype.set_motorSpeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WheelJointDef_set_motorSpeed_1(self, arg0);
};
    Object.defineProperty(b2WheelJointDef.prototype, 'motorSpeed', { get: b2WheelJointDef.prototype.get_motorSpeed, set: b2WheelJointDef.prototype.set_motorSpeed });
  b2WheelJointDef.prototype['get_stiffness'] = b2WheelJointDef.prototype.get_stiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJointDef_get_stiffness_0(self);
};
    b2WheelJointDef.prototype['set_stiffness'] = b2WheelJointDef.prototype.set_stiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WheelJointDef_set_stiffness_1(self, arg0);
};
    Object.defineProperty(b2WheelJointDef.prototype, 'stiffness', { get: b2WheelJointDef.prototype.get_stiffness, set: b2WheelJointDef.prototype.set_stiffness });
  b2WheelJointDef.prototype['get_damping'] = b2WheelJointDef.prototype.get_damping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJointDef_get_damping_0(self);
};
    b2WheelJointDef.prototype['set_damping'] = b2WheelJointDef.prototype.set_damping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WheelJointDef_set_damping_1(self, arg0);
};
    Object.defineProperty(b2WheelJointDef.prototype, 'damping', { get: b2WheelJointDef.prototype.get_damping, set: b2WheelJointDef.prototype.set_damping });
  b2WheelJointDef.prototype['get_type'] = b2WheelJointDef.prototype.get_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2WheelJointDef_get_type_0(self);
};
    b2WheelJointDef.prototype['set_type'] = b2WheelJointDef.prototype.set_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WheelJointDef_set_type_1(self, arg0);
};
    Object.defineProperty(b2WheelJointDef.prototype, 'type', { get: b2WheelJointDef.prototype.get_type, set: b2WheelJointDef.prototype.set_type });
  b2WheelJointDef.prototype['get_userData'] = b2WheelJointDef.prototype.get_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WheelJointDef_get_userData_0(self), b2JointUserData);
};
    b2WheelJointDef.prototype['set_userData'] = b2WheelJointDef.prototype.set_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WheelJointDef_set_userData_1(self, arg0);
};
    Object.defineProperty(b2WheelJointDef.prototype, 'userData', { get: b2WheelJointDef.prototype.get_userData, set: b2WheelJointDef.prototype.set_userData });
  b2WheelJointDef.prototype['get_bodyA'] = b2WheelJointDef.prototype.get_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WheelJointDef_get_bodyA_0(self), b2Body);
};
    b2WheelJointDef.prototype['set_bodyA'] = b2WheelJointDef.prototype.set_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WheelJointDef_set_bodyA_1(self, arg0);
};
    Object.defineProperty(b2WheelJointDef.prototype, 'bodyA', { get: b2WheelJointDef.prototype.get_bodyA, set: b2WheelJointDef.prototype.set_bodyA });
  b2WheelJointDef.prototype['get_bodyB'] = b2WheelJointDef.prototype.get_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2WheelJointDef_get_bodyB_0(self), b2Body);
};
    b2WheelJointDef.prototype['set_bodyB'] = b2WheelJointDef.prototype.set_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WheelJointDef_set_bodyB_1(self, arg0);
};
    Object.defineProperty(b2WheelJointDef.prototype, 'bodyB', { get: b2WheelJointDef.prototype.get_bodyB, set: b2WheelJointDef.prototype.set_bodyB });
  b2WheelJointDef.prototype['get_collideConnected'] = b2WheelJointDef.prototype.get_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2WheelJointDef_get_collideConnected_0(self));
};
    b2WheelJointDef.prototype['set_collideConnected'] = b2WheelJointDef.prototype.set_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2WheelJointDef_set_collideConnected_1(self, arg0);
};
    Object.defineProperty(b2WheelJointDef.prototype, 'collideConnected', { get: b2WheelJointDef.prototype.get_collideConnected, set: b2WheelJointDef.prototype.set_collideConnected });
  b2WheelJointDef.prototype['__destroy__'] = b2WheelJointDef.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2WheelJointDef___destroy___0(self);
};
// b2MotorJoint
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2MotorJoint() { throw "cannot construct a b2MotorJoint, no constructor in IDL" }
b2MotorJoint.prototype = Object.create(b2Joint.prototype);
b2MotorJoint.prototype.constructor = b2MotorJoint;
b2MotorJoint.prototype.__class__ = b2MotorJoint;
b2MotorJoint.__cache__ = {};
Module['b2MotorJoint'] = b2MotorJoint;

b2MotorJoint.prototype['SetLinearOffset'] = b2MotorJoint.prototype.SetLinearOffset = /** @suppress {undefinedVars, duplicate} @this{Object} */function(linearOffset) {
  var self = this.ptr;
  if (linearOffset && typeof linearOffset === 'object') linearOffset = linearOffset.ptr;
  _emscripten_bind_b2MotorJoint_SetLinearOffset_1(self, linearOffset);
};;

b2MotorJoint.prototype['GetLinearOffset'] = b2MotorJoint.prototype.GetLinearOffset = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MotorJoint_GetLinearOffset_0(self), b2Vec2);
};;

b2MotorJoint.prototype['SetAngularOffset'] = b2MotorJoint.prototype.SetAngularOffset = /** @suppress {undefinedVars, duplicate} @this{Object} */function(angularOffset) {
  var self = this.ptr;
  if (angularOffset && typeof angularOffset === 'object') angularOffset = angularOffset.ptr;
  _emscripten_bind_b2MotorJoint_SetAngularOffset_1(self, angularOffset);
};;

b2MotorJoint.prototype['GetAngularOffset'] = b2MotorJoint.prototype.GetAngularOffset = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MotorJoint_GetAngularOffset_0(self);
};;

b2MotorJoint.prototype['SetMaxForce'] = b2MotorJoint.prototype.SetMaxForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(force) {
  var self = this.ptr;
  if (force && typeof force === 'object') force = force.ptr;
  _emscripten_bind_b2MotorJoint_SetMaxForce_1(self, force);
};;

b2MotorJoint.prototype['GetMaxForce'] = b2MotorJoint.prototype.GetMaxForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MotorJoint_GetMaxForce_0(self);
};;

b2MotorJoint.prototype['SetMaxTorque'] = b2MotorJoint.prototype.SetMaxTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(torque) {
  var self = this.ptr;
  if (torque && typeof torque === 'object') torque = torque.ptr;
  _emscripten_bind_b2MotorJoint_SetMaxTorque_1(self, torque);
};;

b2MotorJoint.prototype['GetMaxTorque'] = b2MotorJoint.prototype.GetMaxTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MotorJoint_GetMaxTorque_0(self);
};;

b2MotorJoint.prototype['SetCorrectionFactor'] = b2MotorJoint.prototype.SetCorrectionFactor = /** @suppress {undefinedVars, duplicate} @this{Object} */function(factor) {
  var self = this.ptr;
  if (factor && typeof factor === 'object') factor = factor.ptr;
  _emscripten_bind_b2MotorJoint_SetCorrectionFactor_1(self, factor);
};;

b2MotorJoint.prototype['GetCorrectionFactor'] = b2MotorJoint.prototype.GetCorrectionFactor = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MotorJoint_GetCorrectionFactor_0(self);
};;

b2MotorJoint.prototype['GetType'] = b2MotorJoint.prototype.GetType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MotorJoint_GetType_0(self);
};;

b2MotorJoint.prototype['GetBodyA'] = b2MotorJoint.prototype.GetBodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MotorJoint_GetBodyA_0(self), b2Body);
};;

b2MotorJoint.prototype['GetBodyB'] = b2MotorJoint.prototype.GetBodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MotorJoint_GetBodyB_0(self), b2Body);
};;

b2MotorJoint.prototype['GetAnchorA'] = b2MotorJoint.prototype.GetAnchorA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MotorJoint_GetAnchorA_0(self), b2Vec2);
};;

b2MotorJoint.prototype['GetAnchorB'] = b2MotorJoint.prototype.GetAnchorB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MotorJoint_GetAnchorB_0(self), b2Vec2);
};;

b2MotorJoint.prototype['GetReactionForce'] = b2MotorJoint.prototype.GetReactionForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return wrapPointer(_emscripten_bind_b2MotorJoint_GetReactionForce_1(self, inv_dt), b2Vec2);
};;

b2MotorJoint.prototype['GetReactionTorque'] = b2MotorJoint.prototype.GetReactionTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(inv_dt) {
  var self = this.ptr;
  if (inv_dt && typeof inv_dt === 'object') inv_dt = inv_dt.ptr;
  return _emscripten_bind_b2MotorJoint_GetReactionTorque_1(self, inv_dt);
};;

b2MotorJoint.prototype['GetNext'] = b2MotorJoint.prototype.GetNext = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MotorJoint_GetNext_0(self), b2Joint);
};;

b2MotorJoint.prototype['GetUserData'] = b2MotorJoint.prototype.GetUserData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MotorJoint_GetUserData_0(self), b2JointUserData);
};;

b2MotorJoint.prototype['GetCollideConnected'] = b2MotorJoint.prototype.GetCollideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2MotorJoint_GetCollideConnected_0(self));
};;

  b2MotorJoint.prototype['__destroy__'] = b2MotorJoint.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2MotorJoint___destroy___0(self);
};
// b2MotorJointDef
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2MotorJointDef() {
  this.ptr = _emscripten_bind_b2MotorJointDef_b2MotorJointDef_0();
  getCache(b2MotorJointDef)[this.ptr] = this;
};;
b2MotorJointDef.prototype = Object.create(b2JointDef.prototype);
b2MotorJointDef.prototype.constructor = b2MotorJointDef;
b2MotorJointDef.prototype.__class__ = b2MotorJointDef;
b2MotorJointDef.__cache__ = {};
Module['b2MotorJointDef'] = b2MotorJointDef;

b2MotorJointDef.prototype['Initialize'] = b2MotorJointDef.prototype.Initialize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(bodyA, bodyB) {
  var self = this.ptr;
  if (bodyA && typeof bodyA === 'object') bodyA = bodyA.ptr;
  if (bodyB && typeof bodyB === 'object') bodyB = bodyB.ptr;
  _emscripten_bind_b2MotorJointDef_Initialize_2(self, bodyA, bodyB);
};;

  b2MotorJointDef.prototype['get_linearOffset'] = b2MotorJointDef.prototype.get_linearOffset = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MotorJointDef_get_linearOffset_0(self), b2Vec2);
};
    b2MotorJointDef.prototype['set_linearOffset'] = b2MotorJointDef.prototype.set_linearOffset = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MotorJointDef_set_linearOffset_1(self, arg0);
};
    Object.defineProperty(b2MotorJointDef.prototype, 'linearOffset', { get: b2MotorJointDef.prototype.get_linearOffset, set: b2MotorJointDef.prototype.set_linearOffset });
  b2MotorJointDef.prototype['get_angularOffset'] = b2MotorJointDef.prototype.get_angularOffset = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MotorJointDef_get_angularOffset_0(self);
};
    b2MotorJointDef.prototype['set_angularOffset'] = b2MotorJointDef.prototype.set_angularOffset = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MotorJointDef_set_angularOffset_1(self, arg0);
};
    Object.defineProperty(b2MotorJointDef.prototype, 'angularOffset', { get: b2MotorJointDef.prototype.get_angularOffset, set: b2MotorJointDef.prototype.set_angularOffset });
  b2MotorJointDef.prototype['get_maxForce'] = b2MotorJointDef.prototype.get_maxForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MotorJointDef_get_maxForce_0(self);
};
    b2MotorJointDef.prototype['set_maxForce'] = b2MotorJointDef.prototype.set_maxForce = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MotorJointDef_set_maxForce_1(self, arg0);
};
    Object.defineProperty(b2MotorJointDef.prototype, 'maxForce', { get: b2MotorJointDef.prototype.get_maxForce, set: b2MotorJointDef.prototype.set_maxForce });
  b2MotorJointDef.prototype['get_maxTorque'] = b2MotorJointDef.prototype.get_maxTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MotorJointDef_get_maxTorque_0(self);
};
    b2MotorJointDef.prototype['set_maxTorque'] = b2MotorJointDef.prototype.set_maxTorque = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MotorJointDef_set_maxTorque_1(self, arg0);
};
    Object.defineProperty(b2MotorJointDef.prototype, 'maxTorque', { get: b2MotorJointDef.prototype.get_maxTorque, set: b2MotorJointDef.prototype.set_maxTorque });
  b2MotorJointDef.prototype['get_correctionFactor'] = b2MotorJointDef.prototype.get_correctionFactor = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MotorJointDef_get_correctionFactor_0(self);
};
    b2MotorJointDef.prototype['set_correctionFactor'] = b2MotorJointDef.prototype.set_correctionFactor = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MotorJointDef_set_correctionFactor_1(self, arg0);
};
    Object.defineProperty(b2MotorJointDef.prototype, 'correctionFactor', { get: b2MotorJointDef.prototype.get_correctionFactor, set: b2MotorJointDef.prototype.set_correctionFactor });
  b2MotorJointDef.prototype['get_type'] = b2MotorJointDef.prototype.get_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2MotorJointDef_get_type_0(self);
};
    b2MotorJointDef.prototype['set_type'] = b2MotorJointDef.prototype.set_type = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MotorJointDef_set_type_1(self, arg0);
};
    Object.defineProperty(b2MotorJointDef.prototype, 'type', { get: b2MotorJointDef.prototype.get_type, set: b2MotorJointDef.prototype.set_type });
  b2MotorJointDef.prototype['get_userData'] = b2MotorJointDef.prototype.get_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MotorJointDef_get_userData_0(self), b2JointUserData);
};
    b2MotorJointDef.prototype['set_userData'] = b2MotorJointDef.prototype.set_userData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MotorJointDef_set_userData_1(self, arg0);
};
    Object.defineProperty(b2MotorJointDef.prototype, 'userData', { get: b2MotorJointDef.prototype.get_userData, set: b2MotorJointDef.prototype.set_userData });
  b2MotorJointDef.prototype['get_bodyA'] = b2MotorJointDef.prototype.get_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MotorJointDef_get_bodyA_0(self), b2Body);
};
    b2MotorJointDef.prototype['set_bodyA'] = b2MotorJointDef.prototype.set_bodyA = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MotorJointDef_set_bodyA_1(self, arg0);
};
    Object.defineProperty(b2MotorJointDef.prototype, 'bodyA', { get: b2MotorJointDef.prototype.get_bodyA, set: b2MotorJointDef.prototype.set_bodyA });
  b2MotorJointDef.prototype['get_bodyB'] = b2MotorJointDef.prototype.get_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2MotorJointDef_get_bodyB_0(self), b2Body);
};
    b2MotorJointDef.prototype['set_bodyB'] = b2MotorJointDef.prototype.set_bodyB = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MotorJointDef_set_bodyB_1(self, arg0);
};
    Object.defineProperty(b2MotorJointDef.prototype, 'bodyB', { get: b2MotorJointDef.prototype.get_bodyB, set: b2MotorJointDef.prototype.set_bodyB });
  b2MotorJointDef.prototype['get_collideConnected'] = b2MotorJointDef.prototype.get_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2MotorJointDef_get_collideConnected_0(self));
};
    b2MotorJointDef.prototype['set_collideConnected'] = b2MotorJointDef.prototype.set_collideConnected = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2MotorJointDef_set_collideConnected_1(self, arg0);
};
    Object.defineProperty(b2MotorJointDef.prototype, 'collideConnected', { get: b2MotorJointDef.prototype.get_collideConnected, set: b2MotorJointDef.prototype.set_collideConnected });
  b2MotorJointDef.prototype['__destroy__'] = b2MotorJointDef.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2MotorJointDef___destroy___0(self);
};
// b2RopeTuning
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2RopeTuning() {
  this.ptr = _emscripten_bind_b2RopeTuning_b2RopeTuning_0();
  getCache(b2RopeTuning)[this.ptr] = this;
};;
b2RopeTuning.prototype = Object.create(WrapperObject.prototype);
b2RopeTuning.prototype.constructor = b2RopeTuning;
b2RopeTuning.prototype.__class__ = b2RopeTuning;
b2RopeTuning.__cache__ = {};
Module['b2RopeTuning'] = b2RopeTuning;

  b2RopeTuning.prototype['get_stretchingModel'] = b2RopeTuning.prototype.get_stretchingModel = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RopeTuning_get_stretchingModel_0(self);
};
    b2RopeTuning.prototype['set_stretchingModel'] = b2RopeTuning.prototype.set_stretchingModel = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeTuning_set_stretchingModel_1(self, arg0);
};
    Object.defineProperty(b2RopeTuning.prototype, 'stretchingModel', { get: b2RopeTuning.prototype.get_stretchingModel, set: b2RopeTuning.prototype.set_stretchingModel });
  b2RopeTuning.prototype['get_bendingModel'] = b2RopeTuning.prototype.get_bendingModel = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RopeTuning_get_bendingModel_0(self);
};
    b2RopeTuning.prototype['set_bendingModel'] = b2RopeTuning.prototype.set_bendingModel = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeTuning_set_bendingModel_1(self, arg0);
};
    Object.defineProperty(b2RopeTuning.prototype, 'bendingModel', { get: b2RopeTuning.prototype.get_bendingModel, set: b2RopeTuning.prototype.set_bendingModel });
  b2RopeTuning.prototype['get_damping'] = b2RopeTuning.prototype.get_damping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RopeTuning_get_damping_0(self);
};
    b2RopeTuning.prototype['set_damping'] = b2RopeTuning.prototype.set_damping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeTuning_set_damping_1(self, arg0);
};
    Object.defineProperty(b2RopeTuning.prototype, 'damping', { get: b2RopeTuning.prototype.get_damping, set: b2RopeTuning.prototype.set_damping });
  b2RopeTuning.prototype['get_stretchStiffness'] = b2RopeTuning.prototype.get_stretchStiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RopeTuning_get_stretchStiffness_0(self);
};
    b2RopeTuning.prototype['set_stretchStiffness'] = b2RopeTuning.prototype.set_stretchStiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeTuning_set_stretchStiffness_1(self, arg0);
};
    Object.defineProperty(b2RopeTuning.prototype, 'stretchStiffness', { get: b2RopeTuning.prototype.get_stretchStiffness, set: b2RopeTuning.prototype.set_stretchStiffness });
  b2RopeTuning.prototype['get_stretchHertz'] = b2RopeTuning.prototype.get_stretchHertz = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RopeTuning_get_stretchHertz_0(self);
};
    b2RopeTuning.prototype['set_stretchHertz'] = b2RopeTuning.prototype.set_stretchHertz = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeTuning_set_stretchHertz_1(self, arg0);
};
    Object.defineProperty(b2RopeTuning.prototype, 'stretchHertz', { get: b2RopeTuning.prototype.get_stretchHertz, set: b2RopeTuning.prototype.set_stretchHertz });
  b2RopeTuning.prototype['get_stretchDamping'] = b2RopeTuning.prototype.get_stretchDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RopeTuning_get_stretchDamping_0(self);
};
    b2RopeTuning.prototype['set_stretchDamping'] = b2RopeTuning.prototype.set_stretchDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeTuning_set_stretchDamping_1(self, arg0);
};
    Object.defineProperty(b2RopeTuning.prototype, 'stretchDamping', { get: b2RopeTuning.prototype.get_stretchDamping, set: b2RopeTuning.prototype.set_stretchDamping });
  b2RopeTuning.prototype['get_bendStiffness'] = b2RopeTuning.prototype.get_bendStiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RopeTuning_get_bendStiffness_0(self);
};
    b2RopeTuning.prototype['set_bendStiffness'] = b2RopeTuning.prototype.set_bendStiffness = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeTuning_set_bendStiffness_1(self, arg0);
};
    Object.defineProperty(b2RopeTuning.prototype, 'bendStiffness', { get: b2RopeTuning.prototype.get_bendStiffness, set: b2RopeTuning.prototype.set_bendStiffness });
  b2RopeTuning.prototype['get_bendHertz'] = b2RopeTuning.prototype.get_bendHertz = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RopeTuning_get_bendHertz_0(self);
};
    b2RopeTuning.prototype['set_bendHertz'] = b2RopeTuning.prototype.set_bendHertz = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeTuning_set_bendHertz_1(self, arg0);
};
    Object.defineProperty(b2RopeTuning.prototype, 'bendHertz', { get: b2RopeTuning.prototype.get_bendHertz, set: b2RopeTuning.prototype.set_bendHertz });
  b2RopeTuning.prototype['get_bendDamping'] = b2RopeTuning.prototype.get_bendDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RopeTuning_get_bendDamping_0(self);
};
    b2RopeTuning.prototype['set_bendDamping'] = b2RopeTuning.prototype.set_bendDamping = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeTuning_set_bendDamping_1(self, arg0);
};
    Object.defineProperty(b2RopeTuning.prototype, 'bendDamping', { get: b2RopeTuning.prototype.get_bendDamping, set: b2RopeTuning.prototype.set_bendDamping });
  b2RopeTuning.prototype['get_isometric'] = b2RopeTuning.prototype.get_isometric = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2RopeTuning_get_isometric_0(self));
};
    b2RopeTuning.prototype['set_isometric'] = b2RopeTuning.prototype.set_isometric = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeTuning_set_isometric_1(self, arg0);
};
    Object.defineProperty(b2RopeTuning.prototype, 'isometric', { get: b2RopeTuning.prototype.get_isometric, set: b2RopeTuning.prototype.set_isometric });
  b2RopeTuning.prototype['get_fixedEffectiveMass'] = b2RopeTuning.prototype.get_fixedEffectiveMass = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2RopeTuning_get_fixedEffectiveMass_0(self));
};
    b2RopeTuning.prototype['set_fixedEffectiveMass'] = b2RopeTuning.prototype.set_fixedEffectiveMass = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeTuning_set_fixedEffectiveMass_1(self, arg0);
};
    Object.defineProperty(b2RopeTuning.prototype, 'fixedEffectiveMass', { get: b2RopeTuning.prototype.get_fixedEffectiveMass, set: b2RopeTuning.prototype.set_fixedEffectiveMass });
  b2RopeTuning.prototype['get_warmStart'] = b2RopeTuning.prototype.get_warmStart = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_b2RopeTuning_get_warmStart_0(self));
};
    b2RopeTuning.prototype['set_warmStart'] = b2RopeTuning.prototype.set_warmStart = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeTuning_set_warmStart_1(self, arg0);
};
    Object.defineProperty(b2RopeTuning.prototype, 'warmStart', { get: b2RopeTuning.prototype.get_warmStart, set: b2RopeTuning.prototype.set_warmStart });
  b2RopeTuning.prototype['__destroy__'] = b2RopeTuning.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2RopeTuning___destroy___0(self);
};
// b2RopeDef
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2RopeDef() {
  this.ptr = _emscripten_bind_b2RopeDef_b2RopeDef_0();
  getCache(b2RopeDef)[this.ptr] = this;
};;
b2RopeDef.prototype = Object.create(WrapperObject.prototype);
b2RopeDef.prototype.constructor = b2RopeDef;
b2RopeDef.prototype.__class__ = b2RopeDef;
b2RopeDef.__cache__ = {};
Module['b2RopeDef'] = b2RopeDef;

  b2RopeDef.prototype['get_position'] = b2RopeDef.prototype.get_position = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RopeDef_get_position_0(self), b2Vec2);
};
    b2RopeDef.prototype['set_position'] = b2RopeDef.prototype.set_position = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeDef_set_position_1(self, arg0);
};
    Object.defineProperty(b2RopeDef.prototype, 'position', { get: b2RopeDef.prototype.get_position, set: b2RopeDef.prototype.set_position });
  b2RopeDef.prototype['get_vertices'] = b2RopeDef.prototype.get_vertices = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RopeDef_get_vertices_0(self), b2Vec2);
};
    b2RopeDef.prototype['set_vertices'] = b2RopeDef.prototype.set_vertices = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeDef_set_vertices_1(self, arg0);
};
    Object.defineProperty(b2RopeDef.prototype, 'vertices', { get: b2RopeDef.prototype.get_vertices, set: b2RopeDef.prototype.set_vertices });
  b2RopeDef.prototype['get_count'] = b2RopeDef.prototype.get_count = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_b2RopeDef_get_count_0(self);
};
    b2RopeDef.prototype['set_count'] = b2RopeDef.prototype.set_count = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeDef_set_count_1(self, arg0);
};
    Object.defineProperty(b2RopeDef.prototype, 'count', { get: b2RopeDef.prototype.get_count, set: b2RopeDef.prototype.set_count });
  b2RopeDef.prototype['get_gravity'] = b2RopeDef.prototype.get_gravity = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RopeDef_get_gravity_0(self), b2Vec2);
};
    b2RopeDef.prototype['set_gravity'] = b2RopeDef.prototype.set_gravity = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeDef_set_gravity_1(self, arg0);
};
    Object.defineProperty(b2RopeDef.prototype, 'gravity', { get: b2RopeDef.prototype.get_gravity, set: b2RopeDef.prototype.set_gravity });
  b2RopeDef.prototype['get_tuning'] = b2RopeDef.prototype.get_tuning = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2RopeDef_get_tuning_0(self), b2RopeTuning);
};
    b2RopeDef.prototype['set_tuning'] = b2RopeDef.prototype.set_tuning = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2RopeDef_set_tuning_1(self, arg0);
};
    Object.defineProperty(b2RopeDef.prototype, 'tuning', { get: b2RopeDef.prototype.get_tuning, set: b2RopeDef.prototype.set_tuning });
  b2RopeDef.prototype['__destroy__'] = b2RopeDef.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2RopeDef___destroy___0(self);
};
// b2Rope
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2Rope() {
  this.ptr = _emscripten_bind_b2Rope_b2Rope_0();
  getCache(b2Rope)[this.ptr] = this;
};;
b2Rope.prototype = Object.create(WrapperObject.prototype);
b2Rope.prototype.constructor = b2Rope;
b2Rope.prototype.__class__ = b2Rope;
b2Rope.__cache__ = {};
Module['b2Rope'] = b2Rope;

b2Rope.prototype['Create'] = b2Rope.prototype.Create = /** @suppress {undefinedVars, duplicate} @this{Object} */function(def) {
  var self = this.ptr;
  if (def && typeof def === 'object') def = def.ptr;
  _emscripten_bind_b2Rope_Create_1(self, def);
};;

b2Rope.prototype['SetTuning'] = b2Rope.prototype.SetTuning = /** @suppress {undefinedVars, duplicate} @this{Object} */function(tuning) {
  var self = this.ptr;
  if (tuning && typeof tuning === 'object') tuning = tuning.ptr;
  _emscripten_bind_b2Rope_SetTuning_1(self, tuning);
};;

b2Rope.prototype['Step'] = b2Rope.prototype.Step = /** @suppress {undefinedVars, duplicate} @this{Object} */function(timeStep, iterations, position) {
  var self = this.ptr;
  if (timeStep && typeof timeStep === 'object') timeStep = timeStep.ptr;
  if (iterations && typeof iterations === 'object') iterations = iterations.ptr;
  if (position && typeof position === 'object') position = position.ptr;
  _emscripten_bind_b2Rope_Step_3(self, timeStep, iterations, position);
};;

b2Rope.prototype['Reset'] = b2Rope.prototype.Reset = /** @suppress {undefinedVars, duplicate} @this{Object} */function(position) {
  var self = this.ptr;
  if (position && typeof position === 'object') position = position.ptr;
  _emscripten_bind_b2Rope_Reset_1(self, position);
};;

b2Rope.prototype['Draw'] = b2Rope.prototype.Draw = /** @suppress {undefinedVars, duplicate} @this{Object} */function(draw) {
  var self = this.ptr;
  if (draw && typeof draw === 'object') draw = draw.ptr;
  _emscripten_bind_b2Rope_Draw_1(self, draw);
};;

  b2Rope.prototype['__destroy__'] = b2Rope.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2Rope___destroy___0(self);
};
// b2ClipVertex
/** @suppress {undefinedVars, duplicate} @this{Object} */function b2ClipVertex() {
  this.ptr = _emscripten_bind_b2ClipVertex_b2ClipVertex_0();
  getCache(b2ClipVertex)[this.ptr] = this;
};;
b2ClipVertex.prototype = Object.create(WrapperObject.prototype);
b2ClipVertex.prototype.constructor = b2ClipVertex;
b2ClipVertex.prototype.__class__ = b2ClipVertex;
b2ClipVertex.__cache__ = {};
Module['b2ClipVertex'] = b2ClipVertex;

  b2ClipVertex.prototype['get_v'] = b2ClipVertex.prototype.get_v = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2ClipVertex_get_v_0(self), b2Vec2);
};
    b2ClipVertex.prototype['set_v'] = b2ClipVertex.prototype.set_v = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ClipVertex_set_v_1(self, arg0);
};
    Object.defineProperty(b2ClipVertex.prototype, 'v', { get: b2ClipVertex.prototype.get_v, set: b2ClipVertex.prototype.set_v });
  b2ClipVertex.prototype['get_id'] = b2ClipVertex.prototype.get_id = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_b2ClipVertex_get_id_0(self), b2ContactID);
};
    b2ClipVertex.prototype['set_id'] = b2ClipVertex.prototype.set_id = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_b2ClipVertex_set_id_1(self, arg0);
};
    Object.defineProperty(b2ClipVertex.prototype, 'id', { get: b2ClipVertex.prototype.get_id, set: b2ClipVertex.prototype.set_id });
  b2ClipVertex.prototype['__destroy__'] = b2ClipVertex.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_b2ClipVertex___destroy___0(self);
};
(function() {
  function setupEnums() {
    

    // b2ShapeType

    Module['b2Shape']['e_circle'] = _emscripten_enum_b2ShapeType_e_circle();

    Module['b2Shape']['e_edge'] = _emscripten_enum_b2ShapeType_e_edge();

    Module['b2Shape']['e_polygon'] = _emscripten_enum_b2ShapeType_e_polygon();

    Module['b2Shape']['e_chain'] = _emscripten_enum_b2ShapeType_e_chain();

    Module['b2Shape']['e_typeCount'] = _emscripten_enum_b2ShapeType_e_typeCount();

    

    // b2BodyType

    Module['b2_staticBody'] = _emscripten_enum_b2BodyType_b2_staticBody();

    Module['b2_kinematicBody'] = _emscripten_enum_b2BodyType_b2_kinematicBody();

    Module['b2_dynamicBody'] = _emscripten_enum_b2BodyType_b2_dynamicBody();

    

    // b2JointType

    Module['e_unknownJoint'] = _emscripten_enum_b2JointType_e_unknownJoint();

    Module['e_revoluteJoint'] = _emscripten_enum_b2JointType_e_revoluteJoint();

    Module['e_prismaticJoint'] = _emscripten_enum_b2JointType_e_prismaticJoint();

    Module['e_distanceJoint'] = _emscripten_enum_b2JointType_e_distanceJoint();

    Module['e_pulleyJoint'] = _emscripten_enum_b2JointType_e_pulleyJoint();

    Module['e_mouseJoint'] = _emscripten_enum_b2JointType_e_mouseJoint();

    Module['e_gearJoint'] = _emscripten_enum_b2JointType_e_gearJoint();

    Module['e_wheelJoint'] = _emscripten_enum_b2JointType_e_wheelJoint();

    Module['e_weldJoint'] = _emscripten_enum_b2JointType_e_weldJoint();

    Module['e_frictionJoint'] = _emscripten_enum_b2JointType_e_frictionJoint();

    Module['e_ropeJoint'] = _emscripten_enum_b2JointType_e_ropeJoint();

    Module['e_motorJoint'] = _emscripten_enum_b2JointType_e_motorJoint();

    

    // b2ContactFeatureType

    Module['b2ContactFeature']['e_vertex'] = _emscripten_enum_b2ContactFeatureType_e_vertex();

    Module['b2ContactFeature']['e_face'] = _emscripten_enum_b2ContactFeatureType_e_face();

    

    // b2DrawFlag

    Module['b2Draw']['e_shapeBit'] = _emscripten_enum_b2DrawFlag_e_shapeBit();

    Module['b2Draw']['e_jointBit'] = _emscripten_enum_b2DrawFlag_e_jointBit();

    Module['b2Draw']['e_aabbBit'] = _emscripten_enum_b2DrawFlag_e_aabbBit();

    Module['b2Draw']['e_pairBit'] = _emscripten_enum_b2DrawFlag_e_pairBit();

    Module['b2Draw']['e_centerOfMassBit'] = _emscripten_enum_b2DrawFlag_e_centerOfMassBit();

    

    // b2ManifoldType

    Module['b2Manifold']['e_circles'] = _emscripten_enum_b2ManifoldType_e_circles();

    Module['b2Manifold']['e_faceA'] = _emscripten_enum_b2ManifoldType_e_faceA();

    Module['b2Manifold']['e_faceB'] = _emscripten_enum_b2ManifoldType_e_faceB();

    

    // b2PointState

    Module['b2_nullState'] = _emscripten_enum_b2PointState_b2_nullState();

    Module['b2_addState'] = _emscripten_enum_b2PointState_b2_addState();

    Module['b2_persistState'] = _emscripten_enum_b2PointState_b2_persistState();

    Module['b2_removeState'] = _emscripten_enum_b2PointState_b2_removeState();

    

    // b2StretchingModel

    Module['b2_pbdStretchingModel'] = _emscripten_enum_b2StretchingModel_b2_pbdStretchingModel();

    Module['b2_xpbdStretchingModel'] = _emscripten_enum_b2StretchingModel_b2_xpbdStretchingModel();

    

    // b2BendingModel

    Module['b2_springAngleBendingModel'] = _emscripten_enum_b2BendingModel_b2_springAngleBendingModel();

    Module['b2_pbdAngleBendingModel'] = _emscripten_enum_b2BendingModel_b2_pbdAngleBendingModel();

    Module['b2_xpbdAngleBendingModel'] = _emscripten_enum_b2BendingModel_b2_xpbdAngleBendingModel();

    Module['b2_pbdDistanceBendingModel'] = _emscripten_enum_b2BendingModel_b2_pbdDistanceBendingModel();

    Module['b2_pbdHeightBendingModel'] = _emscripten_enum_b2BendingModel_b2_pbdHeightBendingModel();

  }
  if (runtimeInitialized) setupEnums();
  else addOnInit(setupEnums);
})();
