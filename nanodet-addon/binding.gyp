{
  'targets': [
    {
      'target_name': 'nanodet-native',
      'sources': [ './src/main.cc', './src/nanodet.h', './src/nanodet.cc' ],
      'include_dirs': [
        "<!@(node -p \"require('node-addon-api').include\")",
        '.',
        '/usr/local/lib',
        '/usr/local/include/opencv4',
        '/Users/sasha/Documents/code/repos/ncnn/build/install/include/ncnn'
      ],
       "library_dirs": [ "/usr/local/lib"             ],
      'dependencies': ["<!(node -p \"require('node-addon-api').gyp\")"],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      'xcode_settings': {
        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
        'CLANG_CXX_LIBRARY': 'libc++',
        'MACOSX_DEPLOYMENT_TARGET': '11.7',
        'GCC_SYMBOLS_PRIVATE_EXTERN': 'YES' # -fvisibility=hidden
      },
      'link_settings': {
        'libraries': [
            '/usr/local/lib/libopencv_core.dylib'
        ],
      },
      'msvs_settings': {
        'VCCLCompilerTool': { 'ExceptionHandling': 1 },
      }
    }
  ]
}
