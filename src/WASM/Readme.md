## How to Compile

1. get `emscripten` to compile, ( I used the docker version of it )
   ```
   docker pull trzeci/emscripten
   ```

2. compile

    ```
    docker run --rm -v $(pwd):/src trzeci/emscripten emcc <command goes here>
    ```

3. command to compile `webp.c`

    ```
    emcc -O3 -s WASM=1 -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap"]' \
        -I libwebp \
        webp.c \
        libwebp/src/{dec,dsp,demux,enc,mux,utils}/*.c
    ```


## More Reading

This is the article I followed :
https://developers.google.com/web/updates/2018/03/emscripting-a-c-library

