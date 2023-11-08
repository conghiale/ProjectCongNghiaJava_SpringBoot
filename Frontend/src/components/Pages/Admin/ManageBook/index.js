import { Table, Button, Input, Space, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRef, useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
const { Column } = Table;
const port = 8080;

function BookManager() {
    const token = Cookies.get('bookmatetoken');
    let [dt, setDT] = useState([]);
    const [load, setLoad] = useState(true);
    useEffect(() => {
        axios
            .get('http://localhost:' + port + '/api/products?page=0&size=1000', {
                headers: { 'Content-Type': 'application/json' },
            })
            .then((data) => {
                let t = data.data.products.map((el) => {
                    return {
                        key: el.id,
                        name: el.name,
                        author: el.author.name,
                        authorID: el.author.id,
                        price: el.price,
                        publisher: el.publisher,
                    };
                });
                setDT(t);
            });
    }, [load]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({
                                closeDropdown: false,
                            });
                            setSearchText(selectedKeys[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1890ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });
    const onChange = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookDelete, setBookDelete] = useState({});
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = async () => {
        await axios
            .delete('http://localhost:' + port + '/api/products/' + bookDelete.key, {
                headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            })
            .then((data) => {
                if (data.status === 200) toast.success('Xóa thành công');
                else toast.error('Xóa không thành công');
            })
            .catch((err) => {
                toast.error('Xóa không thành công: ' + err);
            });
        setLoad(!load);
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            // filterSearch: true,
            // onFilter: (value, record) => record.name.startsWith(value),
            // width: '30%',
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Author',
            dataIndex: 'author',
            ...getColumnSearchProps('author'),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'Publisher',
            dataIndex: 'publisher',
            ...getColumnSearchProps('publisher'),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle" style={{ color: 'blue' }}>
                    {/* <a>Invite {record.lastName}</a> */}
                    <a
                        onClick={() => {
                            window.location.href = '/admin/updatebook/' + record.key;
                        }}
                    >
                        Cập nhật
                    </a>
                    <a
                        onClick={() => {
                            setBookDelete(record);
                            showModal();
                        }}
                    >
                        Xóa
                    </a>
                </Space>
            ),
            width: 150,
        },
    ];

    return (
        <>
            <ToastContainer></ToastContainer>
            <Table columns={columns} dataSource={dt} onChange={onChange} style={{ width: '100%' }}></Table>
            <Modal title="Xác nhận" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <span>Bạn có chắc muốn xóa sách '{bookDelete.name}'</span>
            </Modal>
        </>
    );
}

export default BookManager;
