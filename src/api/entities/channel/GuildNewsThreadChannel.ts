import { AbstractThreadChannel } from '@src/api/entities/channel/AbstractThreadChannel'
import { ChannelTypes } from '@src/constants'

export class GuildNewsThreadChannel extends AbstractThreadChannel {
  public type!: ChannelTypes.GUILD_NEWS_THREAD
}
