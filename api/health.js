import { getX402Settings } from '../server/x402-config.js'

export default function handler(_req, res) {
  const settings = getX402Settings()
  res.status(200).json({
    ok: true,
    service: 'based-guestbook-x402',
    network: settings.network,
    builderCode: settings.builderCode,
  })
}
