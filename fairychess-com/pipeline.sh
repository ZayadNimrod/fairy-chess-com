#!/bin/bash 
#TODO compare edit times to not do unnecessary compilations/copies


#(re)build the WASM wrapper library
cd ../fairychess-web
wasm-pack build --release --target web --out-dir pkg
cd -



#compile .ts files
#for tsfile in src/*.ts{,x}; do
#    echo "processing $tsfile"
#    npx tsc --lib es2015,dom --jsx react-jsx --esModuleInterop true $tsfile --outdir build/
#done


#echo "transpiled all .ts files"

#move static HTML/CSS to build
#for staticfile in src/*.{html,css};do
#    echo "copying $staticfile"
#    cp $staticfile build/
#done

echo "moved all static files"


#npx browserify -t browserify-css build/index.js -o build/bundle.js 
npm run build
echo "done!"
#http-server website/