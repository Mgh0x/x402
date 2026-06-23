import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { HTTPFacilitatorClient } from '@x402/core/server'
import { ExactEvmScheme } from '@x402/evm/exact/server'
import { paymentMiddleware, x402ResourceServer } from '@x402/express'

const app = express()
const port = Number(process.env.X402_PORT || 4021)
const payTo = process.env.X402_PAY_TO || '0x85Ea474FfAF21e45ce88185869F13432F92956c3'
const network = process.env.X402_NETWORK || 'eip155:84532'
const facilitatorUrl = process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator'

app.use(cors())
app.use(express.json())

const facilitatorClient = new HTTPFacilitatorClient({
  url: facilitatorUrl,
})

const resourceServer = new x402ResourceServer(facilitatorClient).register(
  network,
  new ExactEvmScheme(),
)

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'based-guestbook-x402',
    network,
  })
})

app.use(
  paymentMiddleware(
    {
      'GET /api/base-signal': {
        accepts: [
          {
            scheme: 'exact',
            price: '$0.001',
            network,
            payTo,
          },
        ],
        description: 'A tiny Base builder signal endpoint for x402 agent payment testing.',
        mimeType: 'application/json',
      },
    },
    resourceServer,
  ),
)

app.get('/api/base-signal', (_req, res) => {
  res.json({
    ok: true,
    message: 'Paid x402 access granted.',
    builder: payTo,
    network,
    timestamp: new Date().toISOString(),
  })
})

app.listen(port, () => {
  console.log(`x402 server listening at http://localhost:${port}`)
  console.log(`Protected route: http://localhost:${port}/api/base-signal`)
})
