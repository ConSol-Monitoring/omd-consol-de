#! /usr/bin/python3

import glob
import os
import yaml
import html

for index in glob.glob("../../../../../../labs.consol.de/omd/packages/*/index.md"):
    package = os.path.basename(os.path.dirname(index))
    print(package)
    print(index)
    with open(index) as fix:
        front_matter = []
        content = []
        in_frontmatter = False
        for line in fix.readlines():
            line = line.rstrip()
            if not in_frontmatter and line.startswith("---"):
                in_frontmatter = True
            elif in_frontmatter and line.startswith("---"):
                in_frontmatter = False
            elif in_frontmatter:
                front_matter.append(line)
            elif line.startswith("{%"):
                pass
            else:
                content.append(line)
        front_matter = yaml.safe_load("\n".join(front_matter))
        print(front_matter)
        print("\n".join(content))
        if not os.path.exists(package):
            os.mkdir(package)
        with open(package+"/index.md", "w") as newix:
            newix.write("---\ntitle: {}\n---\n".format(front_matter["title"]))
            newix.write("<style>\n  thead th:empty {\n    border: thin solid red !important;\n    display: none;\n  }\n</style>\n")
            newix.write("### Overview\n\n")
            newix.write("|||\n")
            newix.write("|---|---|\n")
            if "homepage" in front_matter:
                newix.write("|Homepage:|{}|\n".format(front_matter["homepage"]))
            if "changelog" in front_matter:
                newix.write("|Changelog:|{}|\n".format(front_matter["changelog"]))
            if "doku" in front_matter:
                newix.write("|Documentation:|{}|\n".format(front_matter["doku"]))
            if "attributes" in front_matter:
                for attrdict in front_matter["attributes"]:
                    for attr in attrdict:
                        newix.write("|{}:|{}|\n".format(attr, html.escape(attrdict[attr])))

            if "description" in front_matter:
                newix.write("\n{}\n".format(front_matter["description"]))

            newix.write("\n&#x205F;\n")
            newix.write("### Directory Layout\n\n")
            if "folders" in front_matter:
                newix.write("|||\n")
                newix.write("|---|---|\n")
                for folderdict in front_matter["folders"]:
                    for attr in folderdict:
                        newix.write("|{}:|{}|\n".format(attr, html.escape(folderdict[attr])))
            newix.write("\n&#x205F;\n")
            if package == "apache":
                print(content)
            newix.write("\n".join(content))


