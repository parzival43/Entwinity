filename="$(date +%Y-%m-%d)_entwinity"
echo "$filename"
mv entwinity.hopto.org $filename
git clone https://github.com/parzival43/Entwinity.git
mv Entwinity entwinity.hopto.org
