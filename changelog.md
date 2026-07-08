# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows Semantic Versioning where practical.

---

## [1.0.0] - 2026-07-05

### Added
- Initial release of the Entwinity website.
- Responsive landing page.
- Hero section with community vision.
- Dynamic club loading from `clubs.csv`.
- WhatsApp community integration.
- Contact form with server-side email handling.
- Python backend using Flask.
- Apache reverse proxy configuration.
- HTTPS support with Let's Encrypt.
- Light/Dark theme toggle.
- Mobile-responsive navigation.
- README documentation.

### Changed
- Optimized layout spacing and typography.
- Improved accessibility and semantic HTML.

### Fixed
- Corrected CSV parsing for club descriptions.
- Fixed responsive navigation on smaller screens.
- Fixed asset loading over HTTPS.

### Security
- Moved Brevo API key to server-side .env file.
- Restricted API access through Apache reverse proxy.

## [1.0.1] - 2026-07-08

### Added
- SEO improvements (`robots.txt`, `sitemap.xml`).
- Meta description for search engines.
- Open Graph metadata and WebSite structured data.
- Changelog documentation.
- Missing Community links.

### Fixed
- Fixed forced reflow violation occuring in mobile devices in script.js.
- Fixed asset loading over HTTPS.

### Security
- Removed `.env` from version control.
- Removing server-side `.env' file exposed to the webserver.
- Added only authorized IPs for API usage.