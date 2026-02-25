import React, { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Slider,
  List,
  Button,
  Tag,
  Image,
  Badge,
  Tabs,
  Empty,
  Statistic,
  Divider,
  Tooltip,
} from 'antd'
import {
  SearchOutlined,
  FilterOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  CheckCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  StarOutlined,
} from '@ant-design/icons'

const { Option } = Select
const { TabPane } = Tabs

interface Material {
  id: string
  name: string
  brand: string
  category: string
  price: number
  unit: string
  image: string
  supplier: string
  rating: number
  sales: number
  styles: string[]
  colors: string[]
  isFavorite?: boolean
}

const mockMaterials: Material[] = [
  {
    id: '1',
    name: '实木复合地板',
    brand: '圣象',
    category: '地板',
    price: 189,
    unit: '元/㎡',
    image: '',
    supplier: '京东',
    rating: 4.8,
    sales: 5000,
    styles: ['现代简约', '北欧风'],
    colors: ['原木色', '灰色'],
  },
  {
    id: '2',
    name: '通体大理石瓷砖',
    brand: '马可波罗',
    category: '瓷砖',
    price: 128,
    unit: '元/㎡',
    image: '',
    supplier: '天猫',
    rating: 4.9,
    sales: 8000,
    styles: ['现代简约', '轻奢'],
    colors: ['白色', '灰色'],
  },
  {
    id: '3',
    name: '净味五合一墙面漆',
    brand: '立邦',
    category: '涂料',
    price: 45,
    unit: '元/㎡',
    image: '',
    supplier: '京东',
    rating: 4.7,
    sales: 12000,
    styles: ['现代简约', '北欧风', '日式'],
    colors: ['白色', '米色', '浅灰'],
  },
  {
    id: '4',
    name: '智能马桶',
    brand: '箭牌',
    category: '卫浴',
    price: 3999,
    unit: '元/个',
    image: '',
    supplier: '居然之家',
    rating: 4.6,
    sales: 2000,
    styles: ['现代简约', '轻奢'],
    colors: ['白色'],
  },
  {
    id: '5',
    name: 'LED吸顶灯套装',
    brand: '欧普',
    category: '灯具',
    price: 2599,
    unit: '元/套',
    image: '',
    supplier: '天猫',
    rating: 4.8,
    sales: 6000,
    styles: ['现代简约', '北欧风'],
    colors: ['白色', '暖白'],
  },
  {
    id: '6',
    name: '整体橱柜',
    brand: '欧派',
    category: '橱柜',
    price: 8999,
    unit: '元/延米',
    image: '',
    supplier: '居然之家',
    rating: 4.7,
    sales: 1500,
    styles: ['现代简约', '轻奢'],
    colors: ['白色', '木色'],
  },
]

const categories = [
  { id: 'all', name: '全部', icon: '🏠' },
  { id: 'floor', name: '地板', icon: '🪵' },
  { id: 'tile', name: '瓷砖', icon: '⬜' },
  { id: 'wall', name: '墙面', icon: '🧱' },
  { id: 'bathroom', name: '卫浴', icon: '🚿' },
  { id: 'lighting', name: '灯具', icon: '💡' },
  { id: 'cabinet', name: '橱柜', icon: '🗄️' },
  { id: 'furniture', name: '家具', icon: '🛋️' },
]

const styles = ['现代简约', '北欧风', '新中式', '轻奢', '日式', '美式', '工业风']

const MaterialLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)

  const filteredMaterials = mockMaterials.filter((material) => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || material.category === categories.find(c => c.id === selectedCategory)?.name
    const matchesPrice = material.price >= priceRange[0] && material.price <= priceRange[1]
    const matchesStyle = selectedStyles.length === 0 || selectedStyles.some(s => material.styles.includes(s))
    const matchesSupplier = !selectedSupplier || material.supplier === selectedSupplier
    
    return matchesSearch && matchesCategory && matchesPrice && matchesStyle && matchesSupplier
  })

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h2>材料库</h2>
        </Col>
        <Col>
          <Button type="primary" icon={<ShoppingCartOutlined />}>
            导出清单
          </Button>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Filters */}
        <Col span={6}>
          <Card title="筛选条件" style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: 12 }}>
                搜索
              </label>
              <Input
                placeholder="搜索材料或品牌"
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: 12 }}>
                分类
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    type={selectedCategory === cat.id ? 'primary' : 'default'}
                    size="small"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.icon} {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: 12 }}>
                价格范围 (元/㎡)
              </label>
              <Slider
                range
                min={0}
                max={1000}
                value={priceRange}
                onChange={setPriceRange}
                marks={{
                  0: '0',
                  250: '250',
                  500: '500',
                  750: '750',
                  1000: '1000',
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: 12 }}>
                风格
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {styles.map((style) => (
                  <Tag
                    key={style}
                    color={selectedStyles.includes(style) ? 'blue' : 'default'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedStyles((prev) =>
                        prev.includes(style)
                          ? prev.filter((s) => s !== style)
                          : [...prev, style]
                      )
                    }}
                  >
                    {style}
                  </Tag>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: 12 }}>
                供应商
              </label>
              <Select
                placeholder="选择供应商"
                allowClear
                style={{ width: '100%' }}
                onChange={setSelectedSupplier}
              >
                <Option value="京东">京东</Option>
                <Option value="天猫">天猫</Option>
                <Option value="居然之家">居然之家</Option>
              </Select>
            </div>
          </Card>

          <Card title="预算概览">
            <Statistic
              title="已选材料"
              value={filteredMaterials.length}
              suffix="项"
            />
            <Divider />
            <Statistic
              title="预估总价"
              value={filteredMaterials.reduce((sum, m) => sum + m.price, 0)}
              prefix="¥"
              precision={0}
            />
          </Card>
        </Col>

        {/* Material Grid */}
        <Col span={18}>
          <Tabs defaultActiveKey="grid">
            <TabPane tab="网格视图" key="grid">
              <Row gutter={[16, 16]}>
                {filteredMaterials.map((material) => (
                  <Col span={8} key={material.id}>
                    <Card
                      hoverable
                      cover={
                        <div
                          style={{
                            height: 200,
                            background: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                          }}
                        >
                          <span style={{ fontSize: 64 }}>🎨</span>
                          <Button
                            type="text"
                            icon={favorites.has(material.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              fontSize: 20,
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(material.id)
                            }}
                          />
                          <Badge
                            count={material.supplier}
                            style={{
                              position: 'absolute',
                              bottom: 8,
                              left: 8,
                              background: '#1890ff',
                            }}
                          />
                        </div>
                      }
                      actions={[
                        <Tooltip title="查看详情" key="detail">
                          <Button type="text" icon={<SearchOutlined />} />
                        </Tooltip>,
                        <Tooltip title="加入清单" key="add">
                          <Button type="text" icon={<CheckCircleOutlined />} />
                        </Tooltip>,
                      ]}
                    >
                      <Card.Meta
                        title={
                          <div>
                            <div>{material.name}</div>
                            <div style={{ fontSize: 12, color: '#999' }}>{material.brand}</div>
                          </div>
                        }
                        description={
                          <div>
                            <div style={{ marginBottom: 8 }}>
                              <span style={{ fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }}>
                                ¥{material.price}
                              </span>
                              <span style={{ color: '#999' }}>/{material.unit}</span>
                            </div>
                            
                            <div style={{ marginBottom: 8 }}>
                              {material.styles.map((style) => (
                                <Tag key={style} size="small" style={{ marginRight: 4 }}>
                                  {style}
                                </Tag>
                              ))}
                            </div>
                            
                            <div style={{ fontSize: 12, color: '#999' }}>
                              <StarOutlined /> {material.rating} | 销量 {material.sales}
                            </div>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>

              {filteredMaterials.length === 0 && (
                <Empty description="没有找到匹配的材料" />
              )}
            </TabPane>

            <TabPane tab="列表视图" key="list">
              <List
                dataSource={filteredMaterials}
                renderItem={(material) => (
                  <List.Item
                    actions={[
                      <Button key="add" type="primary">
                        加入清单
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div
                          style={{
                            width: 80,
                            height: 80,
                            background: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 8,
                          }}
                        >
                          🎨
                        </div>
                      }
                      title={
                        <div>
                          {material.name}
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            {material.brand}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: 4 }}>
                            {material.styles.map((s) => <Tag key={s} size="small">{s}</Tag>)}
                          </div>
                          <div>
                            <EnvironmentOutlined /> {material.supplier} | 
                            <StarOutlined /> {material.rating} | 
                            销量 {material.sales}
                          </div>
                        </div>
                      }
                    />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }}>
                        ¥{material.price}
                      </div>
                      <div style={{ color: '#999' }}>/{material.unit}</div>
                    </div>
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  )
}

export default MaterialLibrary