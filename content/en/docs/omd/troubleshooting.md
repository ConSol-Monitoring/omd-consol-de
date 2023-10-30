---
title: Troubleshooting
---

If something goes unexpected, here is a incomplete list of known issues
and how to deal with them.

You could also check the [github issues](https://github.com/ConSol-Monitoring/omd/issues) page to see if
somebody else had the same issue already and maybe even a workaround or solution.

# Apache

## SSL Library Error: error:140AB18F:SSL routines:SSL_CTX_use_certificate:ee key too small

This usually occurs if you restore a backup from an older system, ex. from
Debian 8 to Debian 10. The later apache requires a stronger ssl certificate
than the old system created.

Solution:

  - run `./bin/create_site_selfsigned_cert` to create a new self signed certificate
