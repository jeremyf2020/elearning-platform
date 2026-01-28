import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.cache import cache

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get('type')

        # 1. Standard Chat Messages
        if msg_type == 'chat_message':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': data['message'],
                    'username': data.get('username', 'Anonymous')
                }
            )
        
        # 2. WebRTC Signaling (New)
        # We forward these messages to everyone else so they can connect
        elif msg_type == 'signal':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_signal',
                    'sender_channel_name': self.channel_name, # Unique ID of sender
                    'data': data
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'username': event['username']
        }))

    # New: Forward signal to everyone EXCEPT the sender
    async def send_signal(self, event):
        if self.channel_name != event['sender_channel_name']:
            await self.send(text_data=json.dumps(event['data']))

# ... (Keep WhiteboardConsumer unchanged)