import redis from 'ioredis'
import { redisConfig } from 'src/main'
const statusConnectRedis = {
  CONNECT: 'connect',
  END: 'end',
  ERROR: 'error',
  RECONNECT: 'reconnecting'
}

const handleEventConnection = ({ connectionRedis }: { connectionRedis: any }) => {
  connectionRedis.on(statusConnectRedis.CONNECT, () => {
    console.log('connectionRedis - Connection status: connected')
  })
  connectionRedis.on(statusConnectRedis.END, () => {
    console.log('connectionRedis - Connection status: disconnected')
  })
  connectionRedis.on(statusConnectRedis.RECONNECT, () => {
    console.log('connectionRedis - Connection status: reconnecting')
  })
  connectionRedis.on(statusConnectRedis.ERROR, (err) => {
    console.log(redisConfig)
    console.log(`connectionRedis - Connection status: error ${err}`)
  })
}
export const initRedis = () => {
  console.log('Connecting to Redis with config:', JSON.stringify(redisConfig, null, 2))
  const instanceRedis = new redis({
    host: redisConfig?.host,
    port: redisConfig?.port,
    password: redisConfig?.password
  })
  const client = { instanceConnect: instanceRedis }
  handleEventConnection({ connectionRedis: instanceRedis })
  return client
}

const client = initRedis()
export const getRedis = () => client
