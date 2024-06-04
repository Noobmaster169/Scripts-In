export const BlogIDL = {
    "version": "0.1.0",
    "name": "blog_sol",
    "constants": [
        {
            "name": "USER_SEED",
            "type": {
                "defined": "&[u8]"
            },
            "value": "b\"user\""
        },
        {
            "name": "POST_SEED",
            "type": {
                "defined": "&[u8]"
            },
            "value": "b\"post\""
        }
    ],
    "instructions": [
        {
            "name": "initUser",
            "accounts": [
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "avatar",
                    "type": "string"
                }
            ]
        },
        {
            "name": "createPost",
            "accounts": [
                {
                    "name": "postAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "title",
                    "type": "string"
                },
                {
                    "name": "content",
                    "type": "string"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "UserAccount",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "name": "avatar",
                        "type": "string"
                    },
                    {
                        "name": "authority",
                        "type": "publicKey"
                    },
                    {
                        "name": "lastPostId",
                        "type": "u8"
                    },
                    {
                        "name": "postCount",
                        "type": "u8"
                    }
                ]
            }
        },
        {
            "name": "PostAccount",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "id",
                        "type": "u8"
                    },
                    {
                        "name": "title",
                        "type": "string"
                    },
                    {
                        "name": "content",
                        "type": "string"
                    },
                    {
                        "name": "user",
                        "type": "publicKey"
                    },
                    {
                        "name": "authority",
                        "type": "publicKey"
                    }
                ]
            }
        }
    ],
    "metadata": {
        "address": "FVDLUX9ZnEp943trRR3taTCpEHbZouRRi1bkKqWHPb3j"
    }
};