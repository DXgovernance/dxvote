echo "| Commit   |      Author      |  Message | \n |----------|:-------------:|:------|" > .release.md
git log master..develop --pretty="|[%H](https://github.com/DXgovernance/dxvote/commit/%H)| %cn | %s|" --full-history --no-merges --reverse >> .release.md
