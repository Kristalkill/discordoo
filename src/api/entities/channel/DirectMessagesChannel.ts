import { AbstractChannel } from '@src/api/entities/channel/AbstractChannel'
import { WritableChannel } from '@src/api/entities/channel/interfaces/WritableChannel'
import { ChannelMessagesManager } from '@src/api/managers/messages/ChannelMessagesManager'
import { MessageContent } from '@src/api/entities/message/interfaces/MessageContent'
import { MessageCreateOptions } from '@src/api/entities/message/interfaces/MessageCreateOptions'
import { Message } from '@src/api'

export class DirectMessagesChannel extends AbstractChannel implements WritableChannel {
  public messages!: ChannelMessagesManager

  send(content: MessageContent, options?: MessageCreateOptions): Promise<Message | undefined> {
    return this.client.messages.create(this.id, content, options)
  }
}
