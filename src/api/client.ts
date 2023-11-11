import store from "../redux/store";

interface FetchResult {
    results: object[],
    count: number,
}

export default class ApiClient {
    static fetch(entity: string, page: number, pageSize: number): Promise<FetchResult> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/${entity}?page=${page}&limit=${pageSize}`, {
                headers: {"Authorization": store.getState().account.token!}
            }).then(r => {
                r.status === 200 && r.json().then(j => {
                    resolve(j as FetchResult);
                });
                r.status >= 400 && reject(r.status);
            })
        });
    }

    static delete(entity: string, id: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/${entity}/${id}`, {
                method: "DELETE",
                headers: {"Authorization": store.getState().account.token!}
            }).then(r => {
                r.status >= 400 && reject(r.status);
                resolve(r.status === 204);
            });
        });
    }

    static create(entity: string, data: object): Promise<object> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/${entity}`, {
                method: "POST",
                headers: {"Content-Type": "application/json", "Authorization": store.getState().account.token!},
                body: JSON.stringify(data)
            }).then(r => {
                r.status === 200 && r.json().then(j => resolve(j));
                r.status >= 400 && reject(r.status);
            });
        })
    }

    static update(entity: string, id: number, data: object): Promise<object> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/${entity}/${id}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json", "Authorization": store.getState().account.token!},
                body: JSON.stringify(data)
            }).then(r => {
                r.status === 200 && r.json().then(j => resolve(j));
                r.status >= 400 && reject(r.status);
            });
        })
    }

    static get(entity: string, id: number): Promise<object> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/${entity}/${id}`, {
                headers: {"Authorization": store.getState().account.token!}
            }).then(r => {
                r.status === 200 && r.json().then(j => resolve(j));
                r.status >= 400 && reject(r.status);
            });
        })
    }

    static by_ids(entity: string, ids: number[]): Promise<object> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/${entity}/batch`, {
                method: "POST",
                headers: {"Content-Type": "application/json", "Authorization": store.getState().account.token!},
                body: JSON.stringify({ids: ids})
            }).then(r => {
                r.status === 200 && r.json().then(j => resolve(j));
                r.status >= 400 && reject(r.status);
            });
        })
    }

    static search(entity: string, query: {[key:string]: any}, signal: AbortSignal): Promise<FetchResult> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/${entity}/search?${new URLSearchParams(query)}`, {
                signal,
                method: "GET",
                headers: {"Authorization": store.getState().account.token!}
            }).then(r => {
                r.status === 200 && r.json().then(j => resolve(j as FetchResult));
                r.status >= 400 && reject(r.status);
            });
        })
    }
}