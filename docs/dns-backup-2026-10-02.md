# studiojef.co DNS backup (GoDaddy), taken 2026-10-02 before switching to new Vercel records

Nameservers: ns21.domaincontrol.com / ns22.domaincontrol.com (GoDaddy). Forwarding: none set up.

| Type | Name | Data | TTL |
|---|---|---|---|
| A | @ | 76.76.21.21 | 600 seconds |
| NS | @ | ns21.domaincontrol.com. | 1 Hour |
| NS | @ | ns22.domaincontrol.com. | 1 Hour |
| CNAME | autodiscover | autodiscover.outlook.com. | 1 Hour |
| CNAME | enterpriseenrollment | enterpriseenrollment-s.manage.microsoft.com. | 1 Hour |
| CNAME | enterpriseregistration | enterpriseregistration.windows.net. | 1 Hour |
| CNAME | lyncdiscover | webdir.online.lync.com. | 1 Hour |
| CNAME | sip | sipdir.online.lync.com. | 1 Hour |
| CNAME | www | cname.vercel-dns.com. | 1 Hour |
| CNAME | _domainconnect | _domainconnect.gd.domaincontrol.com. | 1 Hour |
| SOA | @ | Primary nameserver: ns21.domaincontrol.com. | 1 Hour |
| MX | @ | studiojef-co.mail.protection.outlook.com. (Priority 0) | 1 Hour |
| TXT | @ | apple-domain-verification=BjGyccPcgqsxouW0 | 1 Hour |
| TXT | @ | v=spf1 include:spf.protection.outlook.com -all | 1 Hour |
| SRV | _sip._tls.@ | 100 1 443 sipdir.online.lync.com. | 1 Hour |
| SRV | _sipfederationtls._tcp.@ | 100 1 5061 sipfed.online.lync.com. | 1 Hour |

## To revert the website change
- A @ -> 76.76.21.21 (TTL 600 seconds)
- CNAME www -> cname.vercel-dns.com. (TTL 1 Hour)
- Delete the two TXT _vercel records
