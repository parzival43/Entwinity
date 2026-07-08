filename="$(date +%Y-%m-%d_%H:%M:%S)_entwinity"
echo "$filename"
mv entwinity.hopto.org $filename
pwd
git clone https://github.com/parzival43/Entwinity.git
mv Entwinity entwinity.hopto.org
