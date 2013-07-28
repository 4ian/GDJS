echo "Copying GDJS Runtime files to Binaries/Output/release/JSPlatform/Runtime.."

cp -R ../Runtime/* ../../Binaries/Output/release/JsPlatform/Runtime/
rsync -r -u --include=*.js --include=*/ --exclude=* ../../Extensions/  ../../IDE/bin/release/JsPlatform/Runtime/Extensions/

echo "done."

