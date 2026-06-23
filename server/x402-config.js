import { BUILDER_CODE, declareBuilderCodeExtension } from '@x402/extensions/builder-code'

export function getX402Settings(env = process.env) {
  return {
    payTo: env.X402_PAY_TO || '0x85Ea474FfAF21e45ce88185869F13432F92956c3',
    network: env.X402_NETWORK || 'eip155:84532',
    facilitatorUrl: env.X402_FACILITATOR_URL || 'https://x402.org/facilitator',
    builderCode: env.X402_BUILDER_CODE || 'bc_245mi40p',
  }
}

export function createBaseSignalPaymentRoute({ network, payTo, builderCode }) {
  return {
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
    extensions: {
      [BUILDER_CODE]: declareBuilderCodeExtension(builderCode),
    },
  }
}

export function createBaseSignalPayload({ network, payTo, builderCode }) {
  return {
    ok: true,
    message: 'Paid x402 access granted.',
    builder: payTo,
    builderCode,
    network,
    timestamp: new Date().toISOString(),
  }
}
