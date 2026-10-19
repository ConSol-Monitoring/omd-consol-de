---
title: Troubleshooting
---

If something unexpected happens, here is an incomplete list of known issues
and how to deal with them.

You could also check the [GitHub issues](https://github.com/ConSol-Monitoring/omd/issues) page to see if
someone else has already encountered the same issue and found a workaround or solution.

# Apache

## SSL Library Error: error:140AB18F:SSL routines:SSL_CTX_use_certificate:ee key too small

This usually occurs if you restore a backup from an older system, e.g. from
Debian 8 to Debian 10. The newer Apache version requires a stronger SSL certificate
than the old system created.

Solution:

  - run `./bin/create_site_selfsigned_cert` to create a new self-signed certificate
