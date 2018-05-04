[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-RestMethod -Method GET -Uri https://api.github.com/repos/jmarioste/manga-viewer/releases/latest?auth_token=$env:GH_TOKEN -ContentType "json" -OutFile ./docs/scripts/metadata.json >$null 2>&1

git config --global user.email "jassermark.arioste@gmail.com"
git config --global user.name "Jasser Mark Arioste"

rm -r docs-generated/
npm run docs

cd docs-generated
git init
git add .
git commit -m "Automated push to Github Pages"
git push --force --quiet "https://$env:GH_TOKEN@github.com/jmarioste/manga-viewer.git" master:gh-pages --no-verbose >$null 2>&1