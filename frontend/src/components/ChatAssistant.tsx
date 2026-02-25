import React, { useState, useRef, useEffect } from 'react'
import { Input, Button, Avatar, List, Tag, Skeleton, Empty } from 'antd'
import {
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  PictureOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import './ChatAssistant.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  messageType: string
  metadata?: any
  timestamp: Date
}

interface ChatAssistantProps {
  projectId?: number
  sessionId?: number
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ projectId, sessionId }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: '你好！我是你的AI设计助手。我可以帮你：\n\n• 推荐适合的装修风格\n• 解答材料选择问题\n• 分析户型设计\n• 提供预算建议\n\n告诉我你的需求吧！',
          messageType: 'welcome',
          timestamp: new Date(),
        },
      ])
    }
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      messageType: 'text',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    try {
      // TODO: Call API
      // const response = await fetch(`/api/v1/chat/sessions/${sessionId}/messages`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content: inputValue }),
      // })
      // const data = await response.json()

      // Mock response for now
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(inputValue),
        messageType: 'text',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('风格') || lowerInput.includes('装修')) {
      return '根据您的需求，我推荐以下风格：\n\n**现代简约** - 简洁线条，功能至上，适合追求效率的都市人群。\n\n**北欧风** - 自然材质，明亮温馨，特别适合有孩子的家庭。\n\n您更倾向于哪种感觉？我可以为您详细分析。'
    }
    
    if (lowerInput.includes('预算') || lowerInput.includes('价格') || lowerInput.includes('钱')) {
      return '装修预算通常分为三个档次：\n\n• **经济型** (1000-1500元/㎡)：国产主流品牌，实用为主\n• **舒适型** (1500-2500元/㎡)：中高端混搭，性价比之选\n• **豪华型** (2500-4000元/㎡)：进口高端品牌，极致体验\n\n您的预算范围是多少？我可以给出更精准的建议。'
    }
    
    if (lowerInput.includes('地板') || lowerInput.includes('瓷砖')) {
      return '地板和瓷砖各有优缺点：\n\n**实木地板**\n✓ 脚感好，环保\n✗ 价格较高，需保养\n\n**实木复合地板**\n✓ 性价比高，稳定性好\n✗ 脚感略逊于实木\n\n**瓷砖**\n✓ 耐用，易清洁，适合厨房卫生间\n✗ 脚感硬，冬天偏冷\n\n您主要关注哪个空间？'
    }
    
    return '我理解您的需求。为了给您更精准的建议，能否告诉我更多信息？\n\n• 您的户型面积大概是多少？\n• 家庭成员构成如何？\n• 有没有宠物或特殊需求？\n• 喜欢明亮还是温馨的氛围？'
  }

  const renderMessageContent = (message: Message) => {
    if (message.metadata?.suggestions) {
      return (
        <div>
          <div style={{ whiteSpace: 'pre-wrap', marginBottom: 12 }}>
            {message.content}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {message.metadata.suggestions.map((suggestion: any) => (
              <Tag
                key={suggestion.id}
                color="blue"
                style={{ cursor: 'pointer', padding: '4px 12px' }}
                onClick={() => setInputValue(`我想了解${suggestion.name}`)}
              >
                {suggestion.icon} {suggestion.name}
              </Tag>
            ))}
          </div>
        </div>
      )
    }

    if (message.metadata?.options) {
      return (
        <div>
          <div style={{ whiteSpace: 'pre-wrap', marginBottom: 12 }}>
            {message.content}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {message.metadata.options.map((option: any) => (
              <Button
                key={option.id}
                type="default"
                style={{ textAlign: 'left', height: 'auto', padding: '8px 12px' }}
                onClick={() => setInputValue(`我选择${option.name}`)}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>{option.name}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    优点: {option.pros?.join(', ')}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )
    }

    return <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
  }

  return (
    <div className="chat-assistant">
      <div className="chat-messages">
        <List
          dataSource={messages}
          renderItem={(message) => (
            <List.Item
              style={{
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                padding: '8px 0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  maxWidth: '85%',
                }}
              >
                <Avatar
                  icon={message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                  style={{
                    backgroundColor: message.role === 'user' ? '#1890ff' : '#52c41a',
                    margin: message.role === 'user' ? '0 0 0 8px' : '0 8px 0 0',
                  }}
                />
                <div
                  style={{
                    backgroundColor: message.role === 'user' ? '#1890ff' : '#f6ffed',
                    color: message.role === 'user' ? '#fff' : '#333',
                    padding: '12px 16px',
                    borderRadius: message.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  {renderMessageContent(message)}
                </div>
              </div>
            </List.Item>
          )}
        />
        
        {loading && (
          <List.Item style={{ justifyContent: 'flex-start', padding: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#52c41a', marginRight: 8 }} />
              <div style={{ backgroundColor: '#f6ffed', padding: '12px 16px', borderRadius: '16px 16px 16px 4px' }}>
                <Skeleton active paragraph={{ rows: 2 }} />
              </div>
            </div>
          </List.Item>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <Tag
            color="default"
            style={{ cursor: 'pointer' }}
            onClick={() => setInputValue('推荐什么风格？')}
          >
            推荐风格
          </Tag>
          <Tag
            color="default"
            style={{ cursor: 'pointer' }}
            onClick={() => setInputValue('预算怎么分配？')}
          >
            预算建议
          </Tag>
          <Tag
            color="default"
            style={{ cursor: 'pointer' }}
            onClick={() => setInputValue('地板怎么选？')}
          >
            材料选择
          </Tag>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Input.TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入您的问题..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            style={{ height: 'auto' }}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatAssistant