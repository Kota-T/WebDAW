export default class IdManager {
  constructor(length=8){
    this.idLength = length;

    this.ch_list = [];
    for(let i = 0; i < 26; i++)
      this.ch_list.push(String.fromCharCode("a".charCodeAt(0)+i));
    for(let i = 0; i < 26; i++)
      this.ch_list.push(String.fromCharCode("A".charCodeAt(0)+i));
    for(let i = 0; i < 10; i++)
      this.ch_list.push(String(i));

    this.store = new Set();
  }

  generateId(length=this.idLength){
    let id = "";
    for(let i = 0; i < length; i++)
      id += this.ch_list[Math.floor(Math.random() * this.ch_list.length)];

    if(this.store.has(id))
      return this.generateId(length);

    this.store.add(id);
    return id;
  }

  removeId(id){
    if(this.store.has(id))
      this.store.delete(id);
  }

  storeId(id){
    if(!this.store.has(id))
      this.store.add(id);
  }
}
