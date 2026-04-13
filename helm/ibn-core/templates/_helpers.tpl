{{/*
Copyright 2026 Vpnet Cloud Solutions Sdn. Bhd.
Licensed under the Apache License, Version 2.0
See LICENSE in the project root for license information.

Implements RFC 9315 Intent-Based Networking
https://www.rfc-editor.org/rfc/rfc9315
*/}}

{{/*
Expand the name of the chart.
*/}}
{{- define "ibn-core.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this.

NOTE: intentionally does NOT prepend .Release.Name.
The ODA Canvas component-operator discovers this chart by the stable resource
name written into the component CRD (spec.componentName).  Prepending the
release name would make that name release-dependent, breaking Canvas
component discovery.  Use .Values.fullnameOverride for multi-instance
installs in non-Canvas environments.
*/}}
{{- define "ibn-core.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- default .Chart.Name .Values.component.name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "ibn-core.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels — applied to all resources.
*/}}
{{- define "ibn-core.labels" -}}
helm.sh/chart: {{ include "ibn-core.chart" . }}
{{ include "ibn-core.selectorLabels" . }}
app.kubernetes.io/version: {{ .Values.component.version | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
oda.tmforum.org/component: {{ include "ibn-core.fullname" . }}
{{- end }}

{{/*
Selector labels — used in matchLabels / Service selectors.
*/}}
{{- define "ibn-core.selectorLabels" -}}
app.kubernetes.io/name: {{ include "ibn-core.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app: {{ include "ibn-core.fullname" . }}
{{- end }}

{{/*
Service account name.
Falls back to the chart fullname when .Values.serviceAccount.name is not set.
*/}}
{{- define "ibn-core.serviceAccountName" -}}
{{- default (include "ibn-core.fullname" .) .Values.serviceAccount.name | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{/*
Fully-qualified Service hostname (for Istio DestinationRule host field).
Namespace falls back to "components" (ODA Canvas default) when not set.
*/}}
{{- define "ibn-core.serviceFQDN" -}}
{{- $ns := default "components" .Values.namespace -}}
{{ include "ibn-core.fullname" . }}-service.{{ $ns }}.svc.cluster.local
{{- end }}
