// interface NS {
//   id: number;
//   name: string;
// }

const namespaces = [
  { id: 1, name: 'Javascript' },
  { id: 2, name: 'Python' },
  { id: 3, name: 'Node' }
];

// interface Channel {
//   id: number;
//   name: string;
//   namespaceId: number;
// }

const channels = [
  { id: 1, name: 'Closures in JS', namespaceId: 1, msgList: [] },
  {
    id: 2,
    name: 'JS 101',
    namespaceId: 1,
    msgList: [{ author: 'Thanh', text: 'Hi there', createdAt: Date.now() }]
  },
  { id: 3, name: 'Advanced JS', namespaceId: 1, msgList: [] },
  { id: 4, name: 'Python For Beginner', namespaceId: 2, msgList: [] },
  { id: 5, name: 'Decorators', namespaceId: 2, msgList: [] },
  { id: 6, name: 'Flask for Building Webs', namespaceId: 2, msgList: [] },
  { id: 7, name: 'Master Async/Await', namespaceId: 3, msgList: [] },
  { id: 8, name: 'Node JS Web Dev', namespaceId: 3, msgList: [] }
];

module.exports = {
  namespaces,
  channels
};
