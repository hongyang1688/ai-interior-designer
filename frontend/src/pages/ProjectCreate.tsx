import React, { useState } from 'react'
import {
  Steps,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Card,
  Row,
  Col,
  Slider,
  Radio,
  Space,
  Tag,
  message,
} from 'antd'
import {
  UploadOutlined,
  RightOutlined,
  LeftOutlined,
  HomeOutlined,
  PictureOutlined,
  MessageOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import ChatAssistant from '../components/ChatAssistant'

const { Step } = Steps
const { TextArea } = Input
const { Option } = Select

interface StyleOption {
  id: string
  name: string
  icon: string
  description: string
}

const styleOptions: StyleOption[] = [
  { id: 'modern', name: '现代简约', icon: '⚪', description: '简洁线条，功能至上' },
  { id: 'nordic', name: '北欧风', icon: '🌲', description: '自然材质，明亮温馨' },
  { id: 'chinese', name: '新中式', icon: '🏮', description: '传统与现代结合' },
  { id: 'luxury', name: '轻奢', icon: '✨', description: '精致奢华，品质感' },
  { id: 'industrial', name: '工业风', icon: '🏭', description: '原始粗犷，个性十足' },
  { id: 'japanese', name: '日式', icon: '🎋', description: '禅意自然，极简留白' },
  { id: 'american', name: '美式', icon: '🛋️', description: '舒适大气，复古优雅' },
  { id: 'mediterranean', name: '地中海', icon: '🌊', description: '清新浪漫，蓝白调' },
]

const ProjectCreate: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [chatVisible, setChatVisible] = useState(false)

  const steps = [
    {
      title: '基础信息',
      icon: <HomeOutlined />,
    },
    {
      title: '风格选择',
      icon: <PictureOutlined />,
    },
    {
      title: '需求偏好',
      icon: <MessageOutlined />,
    },
    {
      title: '确认提交',
      icon: <CheckCircleOutlined />,
    },
  ]

  const handleStyleToggle = (styleId: string) => {
    setSelectedStyles(prev => {
      if (prev.includes(styleId)) {
        return prev.filter(id => id !== styleId)
      }
      if (prev.length >= 3) {
        message.warning('最多选择3种风格进行混搭')
        return prev
      }
      return [...prev, styleId]
    })
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card title="项目基础信息" bordered={false}>
            <Form form={form} layout="vertical">
              <Form.Item
                name="name"
                label="项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="例如：阳光花园3号楼801" />
              </Form.Item>

              <Form.Item name="description" label="项目描述">
                <TextArea rows={3} placeholder="简单描述您的项目..." />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="s3_source"
                    label="户型图源（S3/OSS）"
                    rules={[{ required: true, message: '请输入图片源地址' }]}
                  >
                    <Input placeholder="s3://bucket-name/floorplans/" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="image_count"
                    label="图片数量"
                  >
                    <InputNumber min={1} max={1000} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="上传参考图（可选）">
                <Upload.Dragger
                  name="files"
                  multiple
                  action="/api/upload"
                  listType="picture"
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">点击或拖拽上传参考图</p>
                  <p className="ant-upload-hint">支持上传喜欢的风格图片，AI将参考这些风格</p>
                </Upload.Dragger>
              </Form.Item>
            </Form>
          </Card>
        )

      case 1:
        return (
          <Card title="选择装修风格（可多选）" bordered={false}>
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">已选择: {selectedStyles.length}/3</Tag>
              {selectedStyles.length > 1 && (
                <Tag color="orange">将生成混搭风格</Tag>
              )}
            </div>

            <Row gutter={[16, 16]}>
              {styleOptions.map(style => (
                <Col span={6} key={style.id}>
                  <Card
                    hoverable
                    onClick={() => handleStyleToggle(style.id)}
                    style={{
                      borderColor: selectedStyles.includes(style.id) ? '#1890ff' : undefined,
                      background: selectedStyles.includes(style.id) ? '#e6f7ff' : undefined,
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>{style.icon}</div>
                      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{style.name}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{style.description}</div>
                    </div>
                    {selectedStyles.includes(style.id) && (
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#1890ff',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        ✓
                      </div>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>

            {selectedStyles.length > 1 && (
              <Card title="风格混搭比例" style={{ marginTop: 24 }}>
                <Form form={form}>
                  {selectedStyles.map((styleId, index) => {
                    const style = styleOptions.find(s => s.id === styleId)
                    return (
                      <Form.Item
                        key={styleId}
                        name={['style_ratio', styleId]}
                        label={`${style?.icon} ${style?.name}`}
                        initialValue={Math.floor(100 / selectedStyles.length)}
                      >
                        <Slider marks={{ 0: '0%', 50: '50%', 100: '100%' }} />
                      </Form.Item>
                    )
                  })}
                </Form>
              </Card>
            )}
          </Card>
        )

      case 2:
        return (
          <Row gutter={24}>
            <Col span={16}>
              <Card title="家庭情况与偏好" bordered={false}>
                <Form form={form} layout="vertical">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="family_members"
                        label="家庭成员数"
                        initialValue={3}
                      >
                        <InputNumber min={1} max={10} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="children"
                        label="儿童数量"
                        initialValue={1}
                      >
                        <InputNumber min={0} max={5} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="has_pets"
                    label="是否有宠物"
                  >
                    <Radio.Group>
                      <Radio value={false}>无宠物</Radio>
                      <Radio value="dog">🐕 狗狗</Radio>
                      <Radio value="cat">🐈 猫咪</Radio>
                      <Radio value="other">其他</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    name="budget"
                    label="装修预算（万元）"
                  >
                    <Slider
                      range
                      min={10}
                      max={200}
                      step={5}
                      marks={{
                        10: '10万',
                        50: '50万',
                        100: '100万',
                        150: '150万',
                        200: '200万',
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="likes"
                    label="喜欢的元素"
                  >
                    <Select mode="tags" placeholder="例如：明亮、木质、简约...">
                      <Option value="bright">☀️ 明亮通透</Option>
                      <Option value="warm">🕯️ 温馨舒适</Option>
                      <Option value="minimal">⚪ 简约干净</Option>
                      <Option value="wood">🪵 木质元素</Option>
                      <Option value="plants">🌿 绿植</Option>
                      <Option value="tech">🔌 智能家居</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="dislikes"
                    label="不喜欢的元素"
                  >
                    <Select mode="tags" placeholder="例如：昏暗、繁琐、冷色调...">
                      <Option value="dark">🌑 昏暗</Option>
                      <Option value="clutter">📦 杂乱</Option>
                      <Option value="cold">🧊 冷色调</Option>
                      <Option value="carpet">🧶 地毯</Option>
                      <Option value="loud">🔊 花哨图案</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="storage_needs"
                    label="收纳需求"
                    initialValue="normal"
                  >
                    <Radio.Group>
                      <Radio.Button value="minimal">📦 极简，东西少</Radio.Button>
                      <Radio.Button value="normal">🗄️ 普通需求</Radio.Button>
                      <Radio.Button value="lots">📚 物品较多</Radio.Button>
                      <Radio.Button value="hoarder">🏚️ 囤货爱好者</Radio.Button>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    name="special_requirements"
                    label="特殊需求"
                  >
                    <TextArea
                      rows={3}
                      placeholder="例如：需要无障碍设计、有 allergies、需要儿童房..."
                    />
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col span={8}>
              <Card
                title="💡 AI助手"
                extra={
                  <Button type="link" onClick={() => setChatVisible(!chatVisible)}>
                    {chatVisible ? '收起' : '展开'}
                  </Button>
                }
              >
                {chatVisible && <ChatAssistant />}
                {!chatVisible && (
                  <div style={{ textAlign: 'center', color: '#999', padding: 24 }}>
                    <MessageOutlined style={{ fontSize: 32 }} />
                    <p>点击展开与AI助手对话</p>
                    <p style={{ fontSize: 12 }}>帮你找到完美的装修风格</p>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        )

      case 3:
        return (
          <Card title="确认项目信息" bordered={false}>
            <div style={{ background: '#f6ffed', padding: 16, borderRadius: 8, marginBottom: 24 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24, marginRight: 8 }} />
              <span style={{ fontWeight: 'bold' }}>准备就绪！请确认以下信息后提交</span>
            </div>

            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card title="基本信息" size="small">
                  <p><strong>项目名称：</strong> {form.getFieldValue('name') || '未填写'}</p>
                  <p><strong>图片源：</strong> {form.getFieldValue('s3_source') || '未填写'}</p>
                  <p><strong>图片数量：</strong> {form.getFieldValue('image_count') || '未填写'}</p>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="风格选择" size="small">
                  <p><strong>选择风格：</strong></p>
                  <div>
                    {selectedStyles.map(id => {
                      const style = styleOptions.find(s => s.id === id)
                      return <Tag key={id} color="blue">{style?.icon} {style?.name}</Tag>
                    })}
                  </div>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="家庭情况" size="small">
                  <p><strong>家庭成员：</strong> {form.getFieldValue('family_members')}人</p>
                  <p><strong>儿童：</strong> {form.getFieldValue('children')}人</p>
                  <p><strong>宠物：</strong> {form.getFieldValue('has_pets') ? '有' : '无'}</p>
                  <p><strong>收纳需求：</strong> {form.getFieldValue('storage_needs')}</p>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="预算范围" size="small">
                  <p><strong>装修预算：</strong> {form.getFieldValue('budget')?.join('-') || '未设置'} 万元</p>
                  <p><strong>喜欢：</strong> {(form.getFieldValue('likes') || []).join(', ')}</p>
                  <p><strong>不喜欢：</strong> {(form.getFieldValue('dislikes') || []).join(', ')}</p>
                </Card>
              </Col>
            </Row>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Button type="primary" size="large" onClick={handleSubmit}>
                提交并开始设计
              </Button>
            </div>
          </Card>
        )

      default:
        return null
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      // TODO: Call API to create project
      console.log('Submit:', { ...values, styles: selectedStyles })
      message.success('项目创建成功！')
      navigate('/projects')
    } catch (error) {
      message.error('请检查表单填写是否完整')
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Steps current={currentStep}>
          {steps.map(step => (
            <Step key={step.title} title={step.title} icon={step.icon} />
          ))}
        </Steps>
      </div>

      <div style={{ marginBottom: 24 }}>{renderStepContent()}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
        <Button
          disabled={currentStep === 0}
          onClick={() => setCurrentStep(currentStep - 1)}
          icon={<LeftOutlined />}
        >
          上一步
        </Button>

        {currentStep < steps.length - 1 && (
          <Button
            type="primary"
            onClick={() => setCurrentStep(currentStep + 1)}
            icon={<RightOutlined />}
          >
            下一步
          </Button>
        )}
      </div>
    </div>
  )
}

export default ProjectCreate