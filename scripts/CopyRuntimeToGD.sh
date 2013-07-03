echo "Copying GDJS Runtime files to IDE/bin/release/JSPlatform/Runtime.."

cp -R ../Runtime/* ../../IDE/bin/release/JsPlatform/Runtime/
rsync -r -u --include=*.js --include=*/ --exclude=* ../../Extensions/  ../../IDE/bin/release/JsPlatform/Runtime/Extensions/

echo "done."

