#! /usr/bin/python3

import glob
import os
import yaml

for index in glob.glob("../../../../../../labs.consol.de/omd/packages/*/index.md"):
    package = os.path.basename(os.path.dirname(index))
    print(package)
    print(index)
    with open(index) as fix:
        front_matter = []
        content = []
        in_frontmatter = False
        for line in fix.readlines():
            if not in_frontmatter and line.startswith("---"):
                in_frontmatter = True
            elif in_frontmatter and line.startswith("---"):
                in_frontmatter = False
            elif in_frontmatter:
                front_matter.append(line)
            else:
                content.append(line)
        front_matter = yaml.safe_load("\n".join(front_matter))
        print(front_matter)
        print("\n".join(content))
        if not os.path.exists(package):
            os.mkdir(package)
        with open(package+"/index.md", "w") as newix:
            newix.write("---\ntitle: {}\n---\n".format(package))
            newix.write("### Overview\n\n")
            newix.write("|||\n")
            newix.write("|---|---|\n")
            if "homepage" in front_matter:
                newix.write("|Homepage|{}|\n".format(front_matter["homepage"]))
            newix.write("\n".join(content))


