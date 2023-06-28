#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import networkEnvSettings from "../lib/config/env"
import { CoreInfrastructure } from "../lib/stacks/core/infrastructure/CoreInfrastructure"

import networkSettings from "../lib/config/network"
import EnvSettings from "../lib/types/EnvSettings"

const environment: string = process.env.NODE_ENV ?? ""

interface EnvSetting {
    prefix: string
    suffix: string
}

let envSettings
if (environment && typeof environment == "string") {
    envSettings = networkEnvSettings[
        environment as keyof EnvSettings
    ] as EnvSetting
}

const { cidr, maxAzs } = networkSettings

const app = new cdk.App()
if (envSettings && envSettings.prefix) {
    console.log("here")
    let { prefix } = envSettings
    new CoreInfrastructure(app, `${prefix}-CoreInfrastructure`, {
        environment,
        prefix,
        cidr,
        maxAzs,
    })
}
