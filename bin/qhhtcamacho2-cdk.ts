#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import networkEnvSettings from "../lib/config/env"
import networkSettings from "../lib/config/network"
import { QHHTCamachoInfrastructure } from "../lib/stacks/QHHTCamachoInfrastructure"

import EnvSettings from "../lib/types/EnvSettings"
import EnvSetting from "../lib/types/EnvSetting"

const app = new cdk.App()

// NODE_ENV is set by sh/[deploy|synth|destroy].sh
const environment: string = process.env.NODE_ENV ?? ""

// Environment settings for: dev, test, staging, prod
let envSettings
if (environment && typeof environment == "string") {
    envSettings = networkEnvSettings[
        environment as keyof EnvSettings
    ] as EnvSetting
}

const { account, region, cidr, maxAzs } = networkSettings

const {
    domainName,
    applicationName,
    tierName,
    tierType,
    solutionStackName,
    serviceRole,
    ec2InstanceProfile,
    instanceType,
    loadBalancerType,
    ASGMinSize,
    ASGMaxSize,
} = app.node.tryGetContext("configuration")

if (envSettings && envSettings.ENV) {
    let { ENV } = envSettings
    new QHHTCamachoInfrastructure(app, `QHHTCamachoInfrastructure`, {
        env: {
            account,
            region,
        },
        ENV,
        cidr,
        maxAzs,
        domainName,
        applicationName,
        tierName,
        tierType,
        solutionStackName,
        serviceRole,
        ec2InstanceProfile,
        instanceType,
        loadBalancerType,
        ASGMinSize,
        ASGMaxSize,
    })
}
