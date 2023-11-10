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
                r.status === 401 && reject(401);
            })
        });
    }

    static delete(entity: string, id: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fetch(`http://127.0.0.1:8000/api/v0/${entity}/${id}`, {
                method: "DELETE",
                headers: {"Authorization": store.getState().account.token!}
            }).then(r => {
                r.status === 401 && reject(401);
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
                r.status === 401 && reject(401);
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
                r.status === 401 && reject(401);
            });
        })
    }
}