import EnvSettings from "../types/EnvSettings"

const networkEnvSettings: EnvSettings = {
    prod: {
        ENV: "PROD",
        suffix: "QHHTCamacho",
        NODE_ENV: "production",
    },
}

export default networkEnvSettings
