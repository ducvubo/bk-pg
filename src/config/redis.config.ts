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
    console.log(`connectionRedis - Connection status: error ${err}`)
  })
}
export const initRedis = () => {
  console.log(redisConfig)

  const instanceRedis = new redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD
    // host: 'localhost',
    // port: 6379
  })

  const client = { instanceConnect: instanceRedis }
  handleEventConnection({ connectionRedis: instanceRedis })
  return client
}

const client = initRedis()
export const getRedis = () => client
