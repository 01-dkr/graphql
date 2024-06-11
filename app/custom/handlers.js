import { surfTo } from "./routing.js";

export { getData, signIn, signOut };

async function getData() {
    const jwt = localStorage.getItem('client-token');
    let result = undefined;

    await fetch('https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
            query: `query event_user {
                user {
                    id
                    login
                    campus
                }
            }`
        })
    }).then(response => response.json())
        .then(output => {
            if (output.data.user.length > 0) {
                console.log(output.data.user[0]);
                return {
                    userId: output.data.user[0].id,
                    name: output.data.user[0].login,
                    campus: output.data.user[0].campus
                };
            } else {
                throw new Error("User not found");
            }
        })
        .then(async (userData) => {
            // console.log(userData.id);
            await fetch('https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`,
                },
                body: JSON.stringify({
                    query: `query getUserInfo ($name:String!, $userId:Int!, $campus:String!) {
                        event_user (
                            where: {event: {path: {_eq: "/dakar/div-01"}}, user: {login: {_eq: $name}}}
                            order_by: {user: {login: asc}}
                        ) {
                            level
                            event {
                                object {
                                    name
                                }
                            }
                            user {
                                audits(where: {auditorLogin: {_eq: $name}, _and: {grade: {_is_null: false}}}) {
                                    auditorLogin
                                    grade
                                    group {
                                        captainLogin
                                        object {
                                            name
                                        }
                                    }
                                }
                                auditRatio
                                attrs
                                projectsFinished: progresses_aggregate (
                                    distinct_on: [objectId]
                                    where: {event: {object: {id: {_eq: 100256}}, _and: {campus: {_eq: $campus}}}, isDone: {_eq: true}}
                                ) {
                                    aggregate {
                                        count
                                    }
                                }
                                projectsInProgress: progresses_aggregate (
                                    where: {_and: [{path: {_ilike: "%/div-01/%"}}, {isDone: {_eq: false}}]}
                                ) {
                                    aggregate {
                                        count
                                    }
                                }
                                xps (where: {path: {_regex: "^\/dakar\/div-01\/(?!.*(?:checkpoint|piscine)).*$"} }) {
                                    amount
                                    path
                                }
                                transactions_aggregate (
                                    where: {type: {_eq: "xp"}, event: {object: {id: {_eq: 100256}}}}
                                    ) {
                                        aggregate {
                                            sum {
                                                amount
                                            }
                                        }
                                    }
                                }
                            }
                            audit(
                                where: {
                                    group: { campus: { _eq: $campus } }
                                    grade: { _is_null: true },
                                    resultId: { _is_null: true },
                                    auditorId: { _eq: $userId },
                                    private: {code: {_is_null: false}}
                                },
                                order_by: {endAt: asc_nulls_last, createdAt: asc}
                            ) {
                                id
                                group {
                                id
                                path
                                captainLogin
                                captain {
                                    isAvailable
                                }
                            }
                            private { code }
                            createdAt
                            endAt
                            version
                            grade
                        }
                    }`,
                    variables: userData
                })
            }).then(response => response.json())
                .then(output => result = output.data.event_user[0])
                .catch(error => console.error(error));
        })
        .catch(error => console.error(error));

    return result;
}

const signIn = () => {
    const identifier = document.querySelector('[name="identifier"]').value;
    const password = document.querySelector('[name="password"]').value;
    if (identifier === '' || password === '') {
        console.error('Invalide password or identifier !!');
        return;
    }
    const encodedCredentials = btoa(`${identifier}:${password}`);
    fetch('https://learn.zone01dakar.sn/api/auth/signin', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${encodedCredentials}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    }).then(response => {
        if (response.ok) return response.json();
        alert('Oops!\n\nSomething went wrong with entered credentials.');
        throw new Error('Authentication failed !!');
    }).then(data => {
            localStorage.setItem('client-token', data);
            console.log('Authentication succeded !!');
            surfTo('/home');
    }).catch(error => console.error(error));
}

const signOut = () => {
    localStorage.removeItem('client-token');
    console.log('Sign out succeded !!');
    surfTo('/');
}
